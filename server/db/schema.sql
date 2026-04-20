-- RPNMore Blog Database Schema
-- Created: 2026-04-18

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author VARCHAR(255) DEFAULT 'Ripple & More Team',
  author_bio TEXT,
  author_image VARCHAR(500),
  image_url VARCHAR(500),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  meta_title VARCHAR(500),
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',
  read_time VARCHAR(50),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_url VARCHAR(500),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'trash')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  source VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(100),
  device_type VARCHAR(50),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, date, source)
);

-- Page Views Log (for detailed analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  time_spent_seconds INTEGER,
  scrolled_percentage INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_analytics_post_id ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);
CREATE INDEX IF NOT EXISTS idx_page_views_post_id ON page_views(post_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS VARCHAR(255) AS $$
DECLARE
  slug_text VARCHAR(255);
BEGIN
  slug_text := lower(title_text);
  slug_text := regexp_replace(slug_text, '[^a-z0-9\s-]', '', 'g');
  slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
  slug_text := regexp_replace(slug_text, '-+', '-', 'g');
  slug_text := trim(both '-' from slug_text);
  RETURN substring(slug_text, 1, 255);
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1) THEN
    INSERT INTO blog_posts (slug, title, content, excerpt, author, image_url, tags, status, published_at) VALUES
      ('future-of-ai-in-design', 
       'The Future of AI in Design',
       '## Introduction\n\nArtificial Intelligence is revolutionizing the design industry in unprecedented ways. From generating complex visuals to automating repetitive tasks, AI tools are becoming indispensable for modern designers.\n\n## How AI is Changing Design\n\n- **Automated Layout Generation**: AI can now create entire page layouts based on content\n- **Style Transfer**: Instantly apply artistic styles to any image\n- **Color Palette Generation**: AI suggests harmonious color schemes\n- **Content-Aware Editing**: Intelligent object removal and background extension\n\n## The Human Touch\n\nWhile AI handles the technical aspects, human creativity remains essential. The best results come from collaboration between human designers and AI tools.',
       'How generative models are reshaping the creative landscape.',
       'Ripple & More Team',
       'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1280&h=720',
       ARRAY['AI', 'Design', 'Technology'],
       'published',
       CURRENT_TIMESTAMP - INTERVAL '5 days');
  END IF;
END $$;