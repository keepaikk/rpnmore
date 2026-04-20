/**
 * Blog API Service
 * Handles all blog-related API calls with proper typing and error handling
 */

import { BlogPost } from '../types';

// API base URL
const API_BASE = '/api/blog';

// Types
export interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  replies?: Comment[];
  status?: 'pending' | 'approved' | 'spam' | 'trash';
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at: string;
  source?: string;
}

export interface BlogStats {
  posts: {
    total: number;
    published: number;
    drafts: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
  };
  subscribers: {
    total: number;
    active: number;
  };
  views: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  
  return response.json();
}

// ============================================
// BLOG POSTS API
// ============================================

/**
 * Get all blog posts with pagination
 */
export async function getPosts(options?: {
  page?: number;
  limit?: number;
  tag?: string;
  status?: 'published' | 'draft' | 'all';
}): Promise<{ posts: BlogPost[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.tag) params.set('tag', options.tag);
  if (options?.status) params.set('status', options.status);
  
  return apiCall(`/posts?${params.toString()}`);
}

/**
 * Get a single post by slug
 */
export async function getPost(slug: string): Promise<BlogPost & { comments: Comment[] }> {
  return apiCall(`/posts/${slug}`);
}

/**
 * Create a new blog post (admin only)
 */
export async function createPost(post: {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  author_bio?: string;
  author_image?: string;
  image_url?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  read_time?: string;
  status?: 'draft' | 'published';
}): Promise<BlogPost> {
  return apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

/**
 * Update a blog post (admin only)
 */
export async function updatePost(slug: string, updates: Partial<{
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_bio: string;
  author_image: string;
  image_url: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  keywords: string[];
  read_time: string;
  status: 'draft' | 'published' | 'archived';
}>): Promise<BlogPost> {
  return apiCall(`/posts/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a blog post (admin only)
 */
export async function deletePost(slug: string): Promise<{ success: boolean; message: string }> {
  return apiCall(`/posts/${slug}`, {
    method: 'DELETE',
  });
}

// ============================================
// COMMENTS API
// ============================================

/**
 * Get comments for a post
 */
export async function getComments(postId: string): Promise<Comment[]> {
  return apiCall(`/comments/${postId}`);
}

/**
 * Submit a new comment
 */
export async function submitComment(comment: {
  post_id: string;
  author_name: string;
  author_email: string;
  author_url?: string;
  content: string;
  parent_id?: string;
}): Promise<Comment & { message?: string }> {
  return apiCall('/comments', {
    method: 'POST',
    body: JSON.stringify(comment),
  });
}

/**
 * Update comment status (admin only)
 */
export async function updateCommentStatus(
  commentId: string,
  status: 'pending' | 'approved' | 'spam' | 'trash'
): Promise<{ id: string; status: string }> {
  return apiCall(`/comments/${commentId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ============================================
// SUBSCRIBERS API
// ============================================

/**
 * Subscribe to newsletter
 */
export async function subscribe(data: {
  email: string;
  name?: string;
  source?: string;
}): Promise<Subscriber> {
  return apiCall('/subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
  return apiCall('/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ============================================
// ANALYTICS API
// ============================================

/**
 * Track a page view
 */
export async function trackView(data: {
  post_id: string;
  session_id?: string;
  referrer?: string;
  time_spent_seconds?: number;
  scrolled_percentage?: number;
}): Promise<{ success: boolean }> {
  return apiCall('/analytics/view', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get post analytics (admin only)
 */
export async function getAnalytics(postId: string, days?: number): Promise<{
  analytics: Array<{
    date: string;
    views: number;
    unique_visitors: number;
    source: string;
  }>;
  totals: {
    total_views: number;
    total_visitors: number;
  };
}> {
  const params = days ? `?days=${days}` : '';
  return apiCall(`/analytics/${postId}${params}`);
}

// ============================================
// ADMIN API
// ============================================

/**
 * Get all comments for moderation (admin only)
 */
export async function getCommentsForModeration(options?: {
  status?: 'pending' | 'approved' | 'spam' | 'trash' | 'all';
  page?: number;
  limit?: number;
}): Promise<Array<Comment & { post_title: string; post_slug: string }>> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  
  return apiCall(`/admin/comments?${params.toString()}`);
}

/**
 * Get all subscribers (admin only)
 */
export async function getSubscribers(options?: {
  status?: 'active' | 'unsubscribed' | 'all';
  page?: number;
  limit?: number;
}): Promise<Subscriber[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  
  return apiCall(`/admin/subscribers?${params.toString()}`);
}

/**
 * Get blog statistics (admin only)
 */
export async function getBlogStats(): Promise<BlogStats> {
  return apiCall('/admin/stats');
}

// ============================================
// REACT HOOKS
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching blog posts
 */
export function useBlogPosts(options?: {
  page?: number;
  limit?: number;
  tag?: string;
}) {
  const [data, setData] = useState<{ posts: BlogPost[]; pagination: any }>({ posts: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPosts(options);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [options?.page, options?.limit, options?.tag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { ...data, loading, error, refetch: fetchPosts };
}

/**
 * Hook for fetching a single blog post
 */
export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<(BlogPost & { comments: Comment[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPost(slug);
        setPost(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}

/**
 * Hook for blog statistics
 */
export function useBlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBlogStats();
      setStats(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}