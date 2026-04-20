import { Router, Request, Response } from 'express';
import { query, queryOne, transaction } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Rate limiting helper (simple in-memory, consider using Redis for production)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Input validation helpers
function sanitizeString(input: string, maxLength: number): string {
  return input.substring(0, maxLength).trim();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 255);
}

// ============================================
// BLOG POSTS ROUTES
// ============================================

// GET /api/blog/posts - List all published posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, tag, status = 'published' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let sql = `
      SELECT 
        id, slug, title, excerpt, author, author_image, 
        image_url, published_at, tags, read_time, views,
        meta_title, meta_description
      FROM blog_posts
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // Filter by status (admin can see drafts)
    if (status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    // Filter by tag
    if (tag) {
      params.push(tag);
      sql += ` AND $${params.length} = ANY(tags)`;
    }
    
    // Add pagination
    params.push(Number(limit), offset);
    sql += ` ORDER BY published_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const posts = await query(sql, params);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM blog_posts WHERE status = $1';
    const countParams = [status];
    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');
    
    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/blog/posts/:slug - Get single post by slug
router.get('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const post = await queryOne(`
      SELECT 
        id, slug, title, content, excerpt, author, author_bio, author_image,
        image_url, published_at, updated_at, tags, read_time, views,
        meta_title, meta_description, keywords, status
      FROM blog_posts
      WHERE slug = $1
    `, [slug]);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count (only for published posts)
    if (post.status === 'published') {
      await query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [post.id]);
      post.views++;
    }
    
    // Get approved comments
    const comments = await query(`
      SELECT id, author_name, content, created_at, parent_id
      FROM comments
      WHERE post_id = $1 AND status = 'approved'
      ORDER BY created_at ASC
    `, [post.id]);
    
    res.json({ ...post, comments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/blog/posts - Create new post (admin)
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      excerpt,
      author,
      author_bio,
      author_image,
      image_url,
      tags,
      meta_title,
      meta_description,
      keywords,
      read_time,
      status = 'draft'
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const slug = generateSlug(title);
    
    // Check for duplicate slug
    const existing = await queryOne('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    if (existing) {
      return res.status(409).json({ error: 'A post with this title already exists' });
    }
    
    const post = await queryOne(`
      INSERT INTO blog_posts (
        slug, title, content, excerpt, author, author_bio, author_image,
        image_url, tags, meta_title, meta_description, keywords, read_time, status,
        published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      slug,
      sanitizeString(title, 500),
      content,
      excerpt ? sanitizeString(excerpt, 1000) : content.substring(0, 200),
      sanitizeString(author || 'Ripple & More Team', 255),
      author_bio,
      author_image,
      image_url,
      tags || [],
      meta_title,
      meta_description,
      keywords || [],
      read_time,
      status,
      status === 'published' ? new Date() : null
    ]);
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/blog/posts/:slug - Update post (admin)
router.put('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const {
      title,
      content,
      excerpt,
      author,
      author_bio,
      author_image,
      image_url,
      tags,
      meta_title,
      meta_description,
      keywords,
      read_time,
      status
    } = req.body;
    
    // Check post exists
    const existing = await queryOne<{ id: string; status: string }>(
      'SELECT id, status FROM blog_posts WHERE slug = $1',
      [slug]
    );
    
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(sanitizeString(title, 500));
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      params.push(content);
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex++}`);
      params.push(sanitizeString(excerpt, 1000));
    }
    if (author !== undefined) {
      updates.push(`author = $${paramIndex++}`);
      params.push(sanitizeString(author, 255));
    }
    if (author_bio !== undefined) {
      updates.push(`author_bio = $${paramIndex++}`);
      params.push(author_bio);
    }
    if (author_image !== undefined) {
      updates.push(`author_image = $${paramIndex++}`);
      params.push(author_image);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      params.push(image_url);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(tags);
    }
    if (meta_title !== undefined) {
      updates.push(`meta_title = $${paramIndex++}`);
      params.push(meta_title);
    }
    if (meta_description !== undefined) {
      updates.push(`meta_description = $${paramIndex++}`);
      params.push(meta_description);
    }
    if (keywords !== undefined) {
      updates.push(`keywords = $${paramIndex++}`);
      params.push(keywords);
    }
    if (read_time !== undefined) {
      updates.push(`read_time = $${paramIndex++}`);
      params.push(read_time);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
      
      // Set published_at when publishing for the first time
      if (status === 'published' && existing.status !== 'published') {
        updates.push(`published_at = $${paramIndex++}`);
        params.push(new Date());
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(slug);
    const sql = `UPDATE blog_posts SET ${updates.join(', ')} WHERE slug = $${paramIndex} RETURNING *`;
    
    const post = await queryOne(sql, params);
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/blog/posts/:slug - Delete post (admin)
router.delete('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const result = await queryOne<{ id: string }>(
      'DELETE FROM blog_posts WHERE slug = $1 RETURNING id',
      [slug]
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ============================================
// COMMENTS ROUTES
// ============================================

// GET /api/blog/comments/:post_id - Get comments for a post
router.get('/comments/:post_id', async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    
    const comments = await query(`
      SELECT 
        id, author_name, author_email, content, parent_id, created_at, status
      FROM comments
      WHERE post_id = $1 AND status = 'approved'
      ORDER BY created_at ASC
    `, [post_id]);
    
    // Organize into tree structure
    const commentMap = new Map();
    const rootComments: any[] = [];
    
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });
    
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });
    
    res.json(rootComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/blog/comments - Submit new comment
router.post('/comments', async (req: Request, res: Response) => {
  try {
    // Rate limiting
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    
    const { post_id, author_name, author_email, author_url, content, parent_id } = req.body;
    
    if (!post_id || !author_name || !author_email || !content) {
      return res.status(400).json({ error: 'Post ID, name, email, and content are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Check for spam (basic checks)
    const content_lower = content.toLowerCase();
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'click here', 'buy now'];
    const isSpam = spamKeywords.some(keyword => content_lower.includes(keyword));
    
    // XSS protection - sanitize content
    const sanitizedContent = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    const comment = await queryOne(`
      INSERT INTO comments (
        post_id, author_name, author_email, author_url, content, parent_id,
        status, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, author_name, content, created_at, parent_id, status
    `, [
      post_id,
      sanitizeString(author_name, 255),
      sanitizeString(author_email, 255),
      author_url ? sanitizeString(author_url, 500) : null,
      sanitizedContent,
      parent_id || null,
      isSpam ? 'spam' : 'pending',
      ip,
      req.headers['user-agent']
    ]);
    
    res.status(201).json({
      ...comment,
      message: isSpam 
        ? 'Comment flagged for review' 
        : 'Comment submitted for approval'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to submit comment' });
  }
});

// PUT /api/blog/comments/:id/status - Update comment status (admin)
router.put('/comments/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'spam', 'trash'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const comment = await queryOne(`
      UPDATE comments SET status = $1 WHERE id = $2
      RETURNING id, status
    `, [status, id]);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({ error: 'Failed to update comment status' });
  }
});

// ============================================
// SUBSCRIBERS ROUTES
// ============================================

// POST /api/blog/subscribe - Email subscription
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    // Rate limiting
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    
    const { email, name, source } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Check if already subscribed
    const existing = await queryOne<{ id: string; status: string }>(
      'SELECT id, status FROM subscribers WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existing) {
      if (existing.status === 'active') {
        return res.status(200).json({ message: 'Already subscribed', id: existing.id });
      }
      // Resubscribe
      await query(`
        UPDATE subscribers 
        SET status = 'active', unsubscribed_at = NULL, subscribed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [existing.id]);
      return res.status(200).json({ message: 'Resubscribed successfully', id: existing.id });
    }
    
    // Create new subscriber
    const subscriber = await queryOne(`
      INSERT INTO subscribers (email, name, source)
      VALUES ($1, $2, $3)
      RETURNING id, email, subscribed_at
    `, [email.toLowerCase(), name ? sanitizeString(name, 255) : null, source || 'blog']);
    
    res.status(201).json(subscriber);
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// POST /api/blog/unsubscribe - Unsubscribe
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    await query(`
      UPDATE subscribers 
      SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
      WHERE email = $1
    `, [email.toLowerCase()]);
    
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// POST /api/blog/analytics/view - Track page view
router.post('/analytics/view', async (req: Request, res: Response) => {
  try {
    const { post_id, session_id, referrer, time_spent_seconds, scrolled_percentage } = req.body;
    
    if (!post_id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Log detailed page view
    await query(`
      INSERT INTO page_views (post_id, session_id, ip_address, user_agent, referrer, time_spent_seconds, scrolled_percentage)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [post_id, session_id, ip, req.headers['user-agent'], referrer, time_spent_seconds, scrolled_percentage]);
    
    // Update daily analytics
    await query(`
      INSERT INTO analytics (post_id, views, unique_visitors, date, source)
      VALUES ($1, 1, 1, CURRENT_DATE, $2)
      ON CONFLICT (post_id, date, source) 
      DO UPDATE SET views = analytics.views + 1
    `, [post_id, referrer || 'direct']);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// GET /api/blog/analytics/:post_id - Get post analytics (admin)
router.get('/analytics/:post_id', async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    const { days = 30 } = req.query;
    
    const analytics = await query(`
      SELECT 
        date, views, unique_visitors, source
      FROM analytics
      WHERE post_id = $1 AND date >= CURRENT_DATE - INTERVAL '${Number(days)} days'
      ORDER BY date DESC
    `, [post_id]);
    
    const totals = await queryOne(`
      SELECT 
        SUM(views) as total_views,
        SUM(unique_visitors) as total_visitors
      FROM analytics
      WHERE post_id = $1
    `, [post_id]);
    
    res.json({ analytics, totals });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/blog/admin/comments - Get all comments for moderation (admin)
router.get('/admin/comments', async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let sql = `
      SELECT c.*, p.title as post_title, p.slug as post_slug
      FROM comments c
      JOIN blog_posts p ON c.post_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND c.status = $${params.length}`;
    }
    
    params.push(Number(limit), offset);
    sql += ` ORDER BY c.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const comments = await query(sql, params);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments for moderation:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET /api/blog/admin/subscribers - Get all subscribers (admin)
router.get('/admin/subscribers', async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let sql = 'SELECT id, email, name, status, source, subscribed_at, unsubscribed_at FROM subscribers WHERE 1=1';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    params.push(Number(limit), offset);
    sql += ` ORDER BY subscribed_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const subscribers = await query(sql, params);
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// GET /api/blog/admin/stats - Get blog statistics (admin)
router.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const [posts, comments, subscribers, views] = await Promise.all([
      queryOne<{ total: string; published: string; drafts: string }>(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'published') as published,
          COUNT(*) FILTER (WHERE status = 'draft') as drafts
        FROM blog_posts
      `),
      queryOne<{ total: string; pending: string; approved: string }>(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'approved') as approved
        FROM comments
      `),
      queryOne<{ total: string; active: string }>(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active
        FROM subscribers
      `),
      queryOne<{ total: string }>('SELECT SUM(views) as total FROM blog_posts')
    ]);
    
    res.json({
      posts: {
        total: parseInt(posts?.total || '0'),
        published: parseInt(posts?.published || '0'),
        drafts: parseInt(posts?.drafts || '0')
      },
      comments: {
        total: parseInt(comments?.total || '0'),
        pending: parseInt(comments?.pending || '0'),
        approved: parseInt(comments?.approved || '0')
      },
      subscribers: {
        total: parseInt(subscribers?.total || '0'),
        active: parseInt(subscribers?.active || '0')
      },
      views: parseInt(views?.total || '0')
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;