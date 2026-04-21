import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
} catch (e) {
  console.warn("firebase-applet-config.json not found or invalid — Firebase disabled");
}

// Initialize Firebase Admin
// Supports FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string) for Dokploy/VPS deployments,
// falls back to applicationDefault() for Google Cloud/AI Studio environments.
let db: admin.firestore.Firestore | null = null;
try {
  if (!admin.apps.length) {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
        console.log("Firebase Admin: using service account from env");
      } catch (e) {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY is invalid JSON, falling back to applicationDefault()");
        credential = admin.credential.applicationDefault();
      }
    } else {
      credential = admin.credential.applicationDefault();
    }
    admin.initializeApp({
      credential,
      projectId: firebaseConfig.projectId,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  }
  db = admin.firestore();
  console.log("Firebase Admin: initialized");
} catch (e) {
  console.warn("Firebase Admin init failed — falling back to in-memory store:", (e as Error).message);
}

// Canonical ventures — single source of truth shared by server + client fallback
const VENTURES = [
  {
    id: 'techafrik',
    title: 'TechAfrik',
    description: 'AI & Blockchain Media for Africa. Delivering tech education, news, and insights across Telegram, WhatsApp, TikTok, Instagram, LinkedIn & X.',
    category: 'Media & Education',
    icon: 'Cpu',
    externalLink: 'https://rpnmore.com/venture/techafrik'
  },
  {
    id: 'dobuygoods',
    title: 'Dobuygoods',
    description: 'Buy & Sell. Pay with Crypto. A marketplace for used electronics and general goods — bridging African commerce with digital asset transactions.',
    category: 'Commerce',
    icon: 'ShoppingCart',
    externalLink: 'https://dobuygoods.rpnmore.com'
  },
  {
    id: 'signupghana',
    title: 'SignupGhana',
    description: 'Branding & Visual Marketing in Ghana. Complete brand identity, 3D signage, LED screen advertising, and corporate merchandise.',
    category: 'Branding',
    icon: 'Palette',
    externalLink: 'https://signupghana.rpnmore.com'
  },
  {
    id: 'biskaken',
    title: 'Biskaken Auto',
    description: 'Trusted Automotive Repair & Services. Professional, reliable, and expert vehicle maintenance — because not everything is digital, yet.',
    category: 'Automotive',
    icon: 'Wrench',
    externalLink: 'https://biskakenauto.rpnmore.com'
  },
  {
    id: 'researchclaw',
    title: 'ResearchClaw',
    description: 'AI-Powered Research & Automation. Agentic AI systems, social media automation at scale, and intelligent workflows across all our ventures.',
    category: 'AI & Automation',
    icon: 'Bot',
    externalLink: 'https://researchclaw.rpnmore.com'
  }
];

const PLACEHOLDER_SERVICES = VENTURES;

const PLACEHOLDER_POSTS = [
  {
    id: 'p1',
    title: 'The Future of AI in Design',
    excerpt: 'How generative models are reshaping the creative landscape.',
    content: 'Full content placeholder...',
    imageUrl: 'https://picsum.photos/seed/future/800/600',
    date: 'March 11, 2026',
    author: 'RPNMORE AI',
    tags: ['AI', 'Design']
  }
];

// In-memory store for "Placeholder Mode"
let memoryServices = [...PLACEHOLDER_SERVICES];
let memoryPosts = [...PLACEHOLDER_POSTS];

// Initialize Postgres Pool (Backup)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("rpnmore-rpnmore") ? false : { rejectUnauthorized: false },
});

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  app.use(express.json());

  // Redirect subdomains to their respective routes
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    
    // SignupGhana subdomain
    if (host.startsWith('signupghana.') || host.startsWith('www.signupghana.')) {
      const path = req.originalUrl === '/' ? '/signupghana' : `/signupghana${req.originalUrl}`;
      return res.redirect(301, `https://rpnmore.com${path}`);
    }
    
    // TechAfrik subdomain - redirect to venture page
    if (host.startsWith('techafrik.') || host.startsWith('www.techafrik.')) {
      return res.redirect(301, 'https://rpnmore.com/venture/techafrik');
    }
    
    // Dobuygoods / DBG subdomain - redirect to venture page
    if (host.startsWith('dbg.') || host.startsWith('dobuygoods.') || host.startsWith('www.dbg.') || host.startsWith('www.dobuygoods.')) {
      return res.redirect(301, 'https://rpnmore.com/venture/dobuygoods');
    }
    
    next();
  });

  // Migrate Firebase services to the canonical ventures list on startup
  try {
    if (db) {
      const snapshot = await db.collection("services").get();
      const ids = snapshot.docs.map(d => d.id);
      const ventureIds = VENTURES.map(v => v.id);
      const isStale = ids.some(id => !ventureIds.includes(id)) || ids.length !== ventureIds.length;
      if (isStale) {
        // Delete old docs and write new ventures
        const batch = db.batch();
        snapshot.docs.forEach(d => batch.delete(d.ref));
        VENTURES.forEach(v => batch.set(db!.collection("services").doc(v.id), v));
        await batch.commit();
        console.log("Firebase services migrated to new ventures");
      }
    }
  } catch (e) {
    console.warn("Firebase ventures migration skipped:", (e as Error).message);
  }

  // Initialize Postgres Tables
  try {
    if (process.env.DATABASE_URL) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT,
          icon TEXT,
          image_url TEXT,
          long_description TEXT,
          updates TEXT,
          additional_info TEXT,
          external_link TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          excerpt TEXT,
          content TEXT,
          image_url TEXT,
          date TEXT,
          author TEXT,
          tags TEXT[],
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Postgres tables initialized");
    }
  } catch (err) {
    console.error("Postgres init skipped (Placeholder Mode active)");
  }

  // Admin password verification — uses runtime env var ADMIN_PASSWORD (never baked into frontend)
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "rpnmore-admin";
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  });

  // API Routes
  app.get("/api/db-status", async (_req, res) => {
    const status = {
      firebase: "placeholder",
      postgres: "placeholder",
    };

    try {
      if (db && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("TODO")) {
        await db.collection("health").doc("check").set({ lastCheck: new Date() });
        status.firebase = "connected";
      }
    } catch (err) {
      status.firebase = "placeholder";
    }

    try {
      if (process.env.DATABASE_URL) {
        await pool.query("SELECT 1");
        status.postgres = "connected";
      } else {
        status.postgres = "not configured";
      }
    } catch (err) {
      status.postgres = "error";
    }

    res.json(status);
  });

  // Services API
  app.get("/api/services", async (_req, res) => {
    try {
      if (db && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("TODO")) {
        const snapshot = await db.collection("services").get();
        if (!snapshot.empty) {
          return res.json(snapshot.docs.map(doc => doc.data()));
        }
      }
      res.json(memoryServices);
    } catch (err) {
      res.json(memoryServices);
    }
  });

  app.post("/api/services", async (req, res) => {
    const services = req.body;
    memoryServices = services; // Update memory store
    
    try {
      // Try Firebase
      if (db) {
        const batch = db.batch();
        services.forEach((s: any) => {
          const ref = db!.collection("services").doc(s.id);
          batch.set(ref, s);
        });
        await batch.commit();
      }

      // Try Postgres
      if (process.env.DATABASE_URL) {
        for (const s of services) {
          await pool.query(`
            INSERT INTO services (id, title, description, category, icon, image_url, long_description, updates, additional_info, external_link)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              category = EXCLUDED.category,
              icon = EXCLUDED.icon,
              image_url = EXCLUDED.image_url,
              long_description = EXCLUDED.long_description,
              updates = EXCLUDED.updates,
              additional_info = EXCLUDED.additional_info,
              external_link = EXCLUDED.external_link,
              updated_at = CURRENT_TIMESTAMP
          `, [s.id, s.title, s.description, s.category, s.icon, s.imageUrl, s.longDescription, s.updates, s.additionalInfo, s.externalLink]);
        }
      }
    } catch (err) {
      console.log("Save to DB skipped (Saved to Memory)");
    }
    res.json({ success: true });
  });

  // Posts API
  app.get("/api/posts", async (_req, res) => {
    try {
      if (db && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("TODO")) {
        const snapshot = await db.collection("posts").orderBy("date", "desc").get();
        if (!snapshot.empty) {
          return res.json(snapshot.docs.map(doc => doc.data()));
        }
      }
      res.json(memoryPosts);
    } catch (err) {
      res.json(memoryPosts);
    }
  });

  app.post("/api/posts", async (req, res) => {
    const post = req.body;
    memoryPosts = [post, ...memoryPosts]; // Update memory store
    
    try {
      if (db) await db.collection("posts").doc(post.id).set(post);

      if (process.env.DATABASE_URL) {
        await pool.query(`
          INSERT INTO posts (id, title, excerpt, content, image_url, date, author, tags)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            image_url = EXCLUDED.image_url,
            date = EXCLUDED.date,
            author = EXCLUDED.author,
            tags = EXCLUDED.tags,
            updated_at = CURRENT_TIMESTAMP
        `, [post.id, post.title, post.excerpt, post.content, post.imageUrl, post.date, post.author, post.tags]);
      }
    } catch (err) {
      console.log("Save post to DB skipped (Saved to Memory)");
    }
    res.json({ success: true });
  });

  app.delete("/api/posts/:id", async (req, res) => {
    const { id } = req.params;
    memoryPosts = memoryPosts.filter(p => p.id !== id);
    try {
      if (db) await db.collection("posts").doc(id).delete();
      if (process.env.DATABASE_URL) {
        await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);
      }
    } catch (err) {
      console.log("Delete post from DB skipped");
    }
    res.json({ success: true });
  });

  // Serve uploaded files as static
  const uploadsDir = path.join(process.cwd(), 'uploads', 'backgrounds');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Default background URLs (Unsplash — no hardcoding in frontend)
  let memoryBackgrounds: string[] = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
  ];

  app.get('/api/home-backgrounds', async (_req, res) => {
    try {
      if (db) {
        const doc = await db.collection('config').doc('home-backgrounds').get();
        if (doc.exists) {
          const data = doc.data();
          if (data?.urls?.length) return res.json({ urls: data.urls });
        }
      }
    } catch {}
    res.json({ urls: memoryBackgrounds });
  });

  app.post('/api/home-backgrounds', async (req, res) => {
    const { urls, images } = req.body;

    // Handle base64 file uploads
    if (Array.isArray(images) && images.length > 0) {
      const savedUrls: string[] = [];
      for (const img of images) {
        const matches = img.data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches) continue;
        const ext = matches[1].split('/')[1] || 'jpg';
        const filename = `bg-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filepath = path.join(process.cwd(), 'uploads', 'backgrounds', filename);
        fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
        savedUrls.push(`/uploads/backgrounds/${filename}`);
      }
      if (savedUrls.length > 0) {
        memoryBackgrounds = savedUrls;
        try { if (db) await db.collection('config').doc('home-backgrounds').set({ urls: savedUrls }); } catch {}
        return res.json({ success: true, urls: savedUrls });
      }
    }

    // Handle plain URL array
    if (Array.isArray(urls) && urls.length > 0) {
      memoryBackgrounds = urls;
      try { if (db) await db.collection('config').doc('home-backgrounds').set({ urls }); } catch {}
      return res.json({ success: true, urls });
    }

    res.status(400).json({ error: 'Provide urls or images array' });
  });

  // Blog API — PostgreSQL-backed (proper blog routes)
  // GET /api/blog/posts — list published posts
  app.get("/api/blog/posts", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({ posts: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
      }
      const { page = 1, limit = 10, tag, status = 'published' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let sql = `SELECT id, slug, title, excerpt, author, author_image, image_url, published_at, tags, read_time, views, meta_title, meta_description FROM blog_posts WHERE 1=1`;
      const params: any[] = [];
      
      if (status !== 'all') {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }
      if (tag) {
        params.push(tag as string);
        sql += ` AND $${params.length} = ANY(tags)`;
      }
      
      const countResult = await pool.query(`SELECT COUNT(*) as total FROM (${sql}) as filtered`, params);
      const total = Number(countResult.rows[0]?.total || 0);
      
      params.push(Number(limit), offset);
      sql += ` ORDER BY published_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
      
      const result = await pool.query(sql, params);
      res.json({
        posts: result.rows,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
      });
    } catch (err) {
      console.error('Blog posts error:', err);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // GET /api/blog/posts/:slug — single post with comments
  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const { slug } = req.params;
      const result = await pool.query(`SELECT id, slug, title, content, excerpt, author, author_bio, author_image, image_url, published_at, updated_at, tags, read_time, views, meta_title, meta_description, keywords, status FROM blog_posts WHERE slug = $1`, [slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      const post = result.rows[0];
      
      // Get approved comments
      const comments = await pool.query(`SELECT id, author_name, content, created_at, parent_id FROM comments WHERE post_id = $1 AND status = 'approved' ORDER BY created_at ASC`, [post.id]);
      
      // Increment views
      await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [post.id]).catch(() => {});
      
      res.json({ ...post, comments: comments.rows });
    } catch (err) {
      console.error('Blog post error:', err);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  // POST /api/blog/posts — create new post (admin)
  app.post("/api/blog/posts", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'Database not configured' });
      }
      const { title, content, excerpt, author, author_bio, author_image, image_url, tags, meta_title, meta_description, keywords, read_time, status = 'draft' } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 255);
      
      const existing = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'A post with this title already exists' });
      }
      
      const result = await pool.query(`INSERT INTO blog_posts (slug, title, content, excerpt, author, author_bio, author_image, image_url, tags, meta_title, meta_description, keywords, read_time, status, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP) RETURNING id, slug, title, status`, [slug, title, content, excerpt || '', author || 'Ripple & More Team', author_bio || '', author_image || '', image_url || '', tags || [], meta_title || '', meta_description || '', keywords || [], read_time || '', status]);
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Create blog post error:', err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // PUT /api/blog/posts/:slug — update post (admin)
  app.put("/api/blog/posts/:slug", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'Database not configured' });
      }
      const { slug } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      const allowedFields = ['title', 'content', 'excerpt', 'author', 'author_bio', 'author_image', 'image_url', 'tags', 'meta_title', 'meta_description', 'keywords', 'read_time', 'status'];
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = $${paramIndex}`);
          params.push(updates[field]);
          paramIndex++;
        }
      }
      
      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(slug);
      
      const result = await pool.query(`UPDATE blog_posts SET ${setClauses.join(', ')} WHERE slug = $${paramIndex} RETURNING id, slug, title, status`, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Update blog post error:', err);
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  // DELETE /api/blog/posts/:slug — delete post (admin)
  app.delete("/api/blog/posts/:slug", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'Database not configured' });
      }
      const { slug } = req.params;
      const result = await pool.query('DELETE FROM blog_posts WHERE slug = $1 RETURNING id', [slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json({ success: true, message: 'Post deleted' });
    } catch (err) {
      console.error('Delete blog post error:', err);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  // CORS headers for API routes
  app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback — serve index.html for all non-API routes
    app.get("*", (req, res, next) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
// rebuild trigger 1776808605
// SSL fix rebuild 1776809162
