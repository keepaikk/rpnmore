import { motion } from 'motion/react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Share2, Twitter, Linkedin, Facebook, ArrowRight, Tag } from 'lucide-react';
import { BLOG_POSTS } from '../constants';
import { BlogPost as BlogPostType } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  'AI': 'bg-[#00C2FF]/20 text-[#00C2FF]',
  'Crypto': 'bg-[#F5A623]/20 text-[#F5A623]',
  'Branding': 'bg-purple-500/20 text-purple-400',
  'Digital Assets': 'bg-[#F5A623]/20 text-[#F5A623]',
  'Africa Tech': 'bg-emerald-500/20 text-emerald-400',
  'Ghana': 'bg-emerald-500/20 text-emerald-400',
  'Customer Service': 'bg-blue-500/20 text-blue-400',
  'Automation': 'bg-indigo-500/20 text-indigo-400',
  'Wealth Building': 'bg-amber-500/20 text-amber-400',
  'Web3': 'bg-pink-500/20 text-pink-400',
  'Web Development': 'bg-cyan-500/20 text-cyan-400',
  'MVP': 'bg-orange-500/20 text-orange-400',
  'React': 'bg-sky-500/20 text-sky-400',
  'Startup': 'bg-violet-500/20 text-violet-400',
  'Case Study': 'bg-rose-500/20 text-rose-400',
  'Business Growth': 'bg-green-500/20 text-green-400',
};

interface BlogPostProps {
  post?: BlogPostType;
}

export default function BlogPostPage({ post: providedPost }: BlogPostProps) {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  
  // Get post from either props or URL params
  const post = providedPost || BLOG_POSTS.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-zinc-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/#blog" className="text-[#F5A623] hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts (same tags, exclude current)
  const relatedPosts = BLOG_POSTS
    .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
    .slice(0, 3);

  // Share URLs
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://rpnmore.com/blog/${post.slug}`;
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(post.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
  };

  // Format date
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.imageUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Ripple & More Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ripple & More Limited',
      logo: {
        '@type': 'ImageObject',
        url: 'https://rpnmore.com/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    keywords: post.keywords?.join(', ') || post.tags.join(', '),
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* JSON-LD Script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/60 via-[#0A0F1E]/40 to-[#0A0F1E]" />
        
        {/* Back button */}
        <Link
          to="/#blog"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Tags */}
        <div className="absolute bottom-32 left-0 right-0 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest backdrop-blur-md ${CATEGORY_COLORS[tag] || 'bg-white/20 text-white'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold text-white leading-tight"
            >
              {post.title}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-white/10"
        >
          {/* Author */}
          <div className="flex items-center gap-3">
            <img
              src={post.authorImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}
              alt={post.author || 'Author'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white font-medium text-sm">{post.author || 'Ripple & More Team'}</p>
              <p className="text-zinc-500 text-xs">Author</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Calendar size={16} />
            {formattedDate}
          </div>

          {/* Read time */}
          {post.readTime && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock size={16} />
              {post.readTime}
            </div>
          )}

          {/* Share buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-zinc-500 text-sm mr-2 hidden sm:inline">Share:</span>
            <a
              href={shareUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-[#00C2FF]/20 text-zinc-400 hover:text-[#00C2FF] transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href={shareUrls.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-blue-600/20 text-zinc-400 hover:text-blue-500 transition-colors"
              aria-label="Share on Facebook"
            >
              <Facebook size={18} />
            </a>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-[#F5A623] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-ul:text-zinc-300 prose-ul:my-6
            prose-li:my-1
            prose-code:text-[#00C2FF] prose-code:bg-white/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
            prose-blockquote:border-l-[#F5A623] prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
            prose-table:border-collapse
            prose-th:bg-white/5 prose-th:text-white prose-th:p-4 prose-th:border prose-th:border-white/10
            prose-td:p-4 prose-td:border prose-td:border-white/10
          "
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 flex-wrap">
            <Tag size={18} className="text-zinc-500" />
            {post.tags.map(tag => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[tag] || 'bg-white/10 text-zinc-400'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        {post.authorBio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-white/5 border border-white/10 rounded-3xl"
          >
            <div className="flex gap-6 items-start">
              <img
                src={post.authorImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}
                alt={post.author || 'Author'}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Written by {post.author || 'Ripple & More Team'}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {post.authorBio}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#F5A623]/40 transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={relatedPost.imageUrl}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-2 group-hover:text-[#F5A623] transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-zinc-500 text-sm">{relatedPost.readTime || '5 min read'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-10 bg-gradient-to-r from-[#F5A623]/10 to-[#00C2FF]/10 border border-[#F5A623]/30 rounded-3xl text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Transform Your Business?
          </h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Let's discuss how AI, automation, and modern tech can help you scale faster.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F5A623] text-[#0A0F1E] font-semibold rounded-xl hover:bg-[#F5A623]/80 transition-colors"
          >
            Get in Touch <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </div>
  );
}

// Helper function to format markdown-like content to HTML
function formatContent(content: string): string {
  if (!content) return '';
  
  // Remove leading/trailing whitespace and normalize line breaks
  let html = content.trim();
  
  // Convert markdown headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, '').trim();
    return `<pre><code>${code}</code></pre>`;
  });
  
  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Convert unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Convert ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Convert blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Convert tables (basic support)
  const tableRegex = /\|(.+)\|\n\|[-|\s]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').filter((h: string) => h.trim()).map((h: string) => `<th>${h.trim()}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  
  // Convert paragraphs (any remaining lines that aren't already HTML)
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap if already wrapped in a block element
    if (block.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|table|p)/)) return block;
    return `<p>${block}</p>`;
  }).join('\n');
  
  return html;
}