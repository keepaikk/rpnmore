import { motion } from 'motion/react';
import { BlogPost } from '../types';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogProps {
  posts: BlogPost[];
}

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

export default function Blog({ posts }: BlogProps) {
  return (
    <section id="blog" className="py-32 px-6 bg-white dark:bg-[#0A0F1E] transition-colors duration-300 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C2FF]/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-widest text-[#00C2FF] mb-4"
            >
              Education Hub
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight leading-none"
            >
              LEARN. GROW. <br />
              <span className="text-[#F5A623] italic">BUILD WEALTH.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-zinc-600 dark:text-zinc-400 text-lg"
          >
            Free education and insights on digital assets, AI, crypto, and financial freedom — written for everyday Africans.
          </motion.p>
        </div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {['All Posts', 'Digital Assets', 'AI & Automation', 'Mobile Money', 'Africa Tech', 'Portfolio Building'].map(cat => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-colors border ${
                cat === 'All Posts'
                  ? 'bg-[#F5A623] text-[#0A0F1E] border-[#F5A623]'
                  : 'border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-[#F5A623]/50 hover:text-[#F5A623]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => {
            const postSlug = post.slug || post.id;
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-zinc-50 dark:bg-white/[0.03] border border-black/10 dark:border-white/5 rounded-3xl overflow-hidden hover:border-[#F5A623]/40 transition-all"
              >
                <Link to={`/blog/${postSlug}`} className="block">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width="640"
                      height="360"
                    />
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      {post.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest backdrop-blur-md ${CATEGORY_COLORS[tag] || 'bg-black/60 text-white'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
                <div className="p-8">
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {post.author}
                    </div>
                    {post.readTime && (
                      <span className="text-zinc-500">• {post.readTime}</span>
                    )}
                  </div>
                  <Link to={`/blog/${postSlug}`}>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-[#F5A623] transition-colors leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link 
                    to={`/blog/${postSlug}`}
                    className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white group-hover:gap-4 transition-all"
                  >
                    READ MORE <ArrowRight size={16} className="text-[#F5A623]" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Newsletter block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 rounded-3xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-10 md:p-16 text-center"
        >
          <h3 className="text-2xl md:text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
            Get Weekly Insights — <span className="text-[#F5A623]">Free</span>
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            Join thousands of Africans learning to build digital wealth. No spam. Just value.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
            <button className="px-6 py-4 bg-[#F5A623] text-[#0A0F1E] font-semibold rounded-xl hover:bg-[#F5A623]/80 transition-colors whitespace-nowrap">
              Subscribe Free →
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C2FF]/30 to-transparent" />
    </section>
  );
}
