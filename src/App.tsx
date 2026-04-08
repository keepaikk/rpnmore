/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import BooksGrid from './components/BooksGrid';
import Blog from './components/Blog';
import BlogGenerator from './components/BlogGenerator';
import About from './components/FeaturedWork';
import ServicePage from './components/ServicePage';
import AdminDashboard from './components/AdminDashboard';
import AiChat from './components/AiChat';
import ContactForm from './components/ContactForm';
import { BlogPost, Service, Book } from './types';
import { SERVICES as INITIAL_SERVICES, BOOKS as INITIAL_BOOKS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, X, Eye, EyeOff } from 'lucide-react';
import { cn } from './lib/utils';


const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'What is Stellar (XLM) and Why It Matters for Africans',
    excerpt: 'Stellar\'s fast, low-cost cross-border payment network is perfectly positioned for African financial markets. Here\'s why XLM could change how money moves across the continent.',
    content: 'Full content here...',
    imageUrl: 'https://picsum.photos/seed/stellar-xlm/1280/720',
    date: 'March 10, 2026',
    author: 'TechAfrik Team',
    tags: ['Crypto', 'Digital Assets']
  },
  {
    id: '2',
    title: '5 AI Tools Every African Entrepreneur Should Use in 2026',
    excerpt: 'From content automation to customer service — AI is leveling the playing field for African businesses. These are the tools making the biggest impact right now.',
    content: 'Full content here...',
    imageUrl: 'https://picsum.photos/seed/ai-tools-africa/1280/720',
    date: 'March 8, 2026',
    author: 'ResearchClaw AI',
    tags: ['AI', 'Africa Tech']
  },
  {
    id: '3',
    title: 'Start Small, Grow Smart: The Ripple & More Philosophy',
    excerpt: 'You don\'t need thousands of dollars to start building digital wealth. Our philosophy is simple: start with what you have, learn as you grow, and let compounding do the rest.',
    content: 'Full content here...',
    imageUrl: 'https://picsum.photos/seed/ripple-more-philosophy/1280/720',
    date: 'March 5, 2026',
    author: 'Ripple & More',
    tags: ['Digital Assets', 'Africa Tech']
  }
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const WHY_ITEMS = [
  { icon: '🤖', title: 'AI-First', desc: 'Every venture is powered by automation and intelligent systems built for scale.' },
  { icon: '🌍', title: 'Africa-Focused', desc: 'We understand African markets, mobile money, and the unique opportunities across the continent.' },
  { icon: '🔗', title: 'Crypto-Native', desc: 'From payments to education — digital assets are built into everything we do.' },
  { icon: '🏗️', title: 'Multi-Venture', desc: 'One parent company. Multiple focused ventures. Each solving a specific problem for a specific market.' },
  { icon: '🇬🇭', title: 'Ghanaian Roots, Pan-African Vision', desc: 'Born in Ghana. Built for Africa. Serving the Continent.' },
];

const STATS = [
  { value: '5+', label: 'Active Ventures' },
  { value: '2', label: 'Continents' },
  { value: '10+', label: 'African Markets' },
  { value: '1', label: 'Unified Mission' },
];

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('rpnmore_theme');
    return saved ? saved === 'dark' : true;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('rpnmore_admin') === 'true';
  });

  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const adminInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, postsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/posts')
        ]);

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          if (data.length > 0) setServices(data);
        }

        if (postsRes.ok) {
          const data = await postsRes.json();
          if (data.length > 0) setPosts(data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPost = async (newPost: BlogPost) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) setPosts(prev => [newPost, ...prev]);
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const updateServices = async (newServices: Service[]) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServices)
      });
      if (res.ok) {
        setServices(newServices);
      }
    } catch (err) {
      console.error('Failed to save services:', err);
    }
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.setItem('rpnmore_admin', 'false');
    } else {
      setAdminInput('');
      setAdminError('');
      setShowAdminPrompt(true);
      setTimeout(() => adminInputRef.current?.focus(), 100);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminInput }),
      });
      if (res.ok) {
        setIsAdmin(true);
        localStorage.setItem('rpnmore_admin', 'true');
        setShowAdminPrompt(false);
        setAdminInput('');
        setAdminError('');
      } else {
        setAdminError('Incorrect password. Try again.');
        setAdminInput('');
      }
    } catch {
      setAdminError('Server error. Please try again.');
    }
  };

  // Render immediately with defaults — no blocking spinner
  if (isLoading && services.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-bold tracking-widest text-xs animate-pulse">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />

      {/* Admin Password Modal */}
      <AnimatePresence>
        {showAdminPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAdminPrompt(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#0D1426] border border-black/10 dark:border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white">ADMIN <span className="text-[#F5A623] italic">ACCESS</span></h3>
                <button onClick={() => setShowAdminPrompt(false)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>
              <div className="relative mb-4">
                <input
                  ref={adminInputRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  className="w-full bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 pr-12 text-black dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  value={adminInput}
                  onChange={e => { setAdminInput(e.target.value); setAdminError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {adminError && (
                <p className="text-red-500 text-sm font-medium mb-4">{adminError}</p>
              )}
              <button
                onClick={handleAdminLogin}
                className="w-full bg-[#F5A623] text-[#0A0F1E] font-semibold py-4 rounded-xl hover:bg-[#F5A623]/80 transition-all shadow-lg shadow-[#F5A623]/20"
              >
                UNLOCK ADMIN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "min-h-screen transition-colors duration-300 selection:bg-[#F5A623] selection:text-[#0A0F1E]",
        isDark ? "bg-[#0A0F1E] text-white dark" : "bg-white text-black"
      )}>
        <Navbar isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <About />
              <Services services={services} />
              <BooksGrid books={INITIAL_BOOKS} />

              {/* Why Ripple & More */}
              <section className="py-32 px-6 bg-zinc-50 dark:bg-[#0D1426] transition-colors duration-300 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C2FF]/30 to-transparent" />
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="text-xs font-semibold uppercase tracking-widest text-[#00C2FF] mb-4"
                    >
                      Why Us
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight"
                    >
                      WHY CHOOSE <span className="text-[#F5A623] italic">RIPPLE & MORE?</span>
                    </motion.h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {WHY_ITEMS.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-[#F5A623]/30 transition-all group"
                      >
                        <span className="text-4xl mb-4 block">{item.icon}</span>
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-3 group-hover:text-[#F5A623] transition-colors">{item.title}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Stats Bar */}
              <section className="py-16 px-6 bg-[#F5A623] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, #0A0F1E 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
                <div className="max-w-7xl mx-auto relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center"
                      >
                        <p className="text-5xl font-bold text-[#0A0F1E]">{stat.value}</p>
                        <p className="text-sm font-medium text-[#0A0F1E]/70 uppercase tracking-widest mt-2">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {isAdmin && <BlogGenerator onPostGenerated={handleAddPost} />}

              <Blog posts={posts} />

              {isAdmin && (
                <AdminDashboard
                  services={services}
                  onUpdateServices={updateServices}
                  posts={posts}
                  onAddPost={handleAddPost}
                  onDeletePost={handleDeletePost}
                />
              )}

              {/* Contact Section */}
              <section id="contact" className="py-24 px-6 bg-white dark:bg-[#0A0F1E] transition-colors duration-300 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5A623]/30 to-transparent" />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F5A623]/5 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Left — copy */}
                    <div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-4"
                      >
                        Get in Touch
                      </motion.p>
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight mb-6"
                      >
                        Let's Build <br />
                        <span className="text-[#F5A623]">Something Together.</span>
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed mb-10 max-w-md"
                      >
                        Whether you're an individual, a business, or a partner — there's a place for you in the Ripple & More ecosystem.
                      </motion.p>

                      {/* Contact details */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        {[
                          { label: 'Email', value: 'info@rpnmore.com', href: 'mailto:info@rpnmore.com' },
                          { label: 'Call / WhatsApp', value: '+233 598 919 014', href: 'https://wa.me/233598919014' },
                          { label: 'Channel', value: 'Join our WhatsApp Channel', href: 'https://chat.whatsapp.com/B99AHfBj97o7BtqmtEUQR2?mode=gi_t' },
                          { label: 'Location', value: 'Ghana · Africa', href: null },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-4">
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 w-20">{item.label}</span>
                            {item.href ? (
                              <a href={item.href} className="text-sm font-medium text-black dark:text-white hover:text-[#F5A623] transition-colors">{item.value}</a>
                            ) : (
                              <span className="text-sm font-medium text-black dark:text-white">{item.value}</span>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Right — form */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="bg-zinc-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-3xl p-8 md:p-10"
                    >
                      <ContactForm />
                    </motion.div>
                  </div>
                </div>
              </section>
            </main>
          } />

          <Route path="/books" element={<BooksGrid books={INITIAL_BOOKS} />} />
          <Route path="/venture/:id" element={<ServicePage services={services} />} />
        </Routes>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-white/5 bg-[#060A14]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#F5A623] rounded flex items-center justify-center">
                    <span className="text-[#0A0F1E] font-black">R</span>
                  </div>
                  <span className="text-white font-bold text-xl tracking-tight">Ripple & More</span>
                </div>
                <p className="text-zinc-500 text-sm mb-2">Founded in Ghana · Built for Africa</p>
                <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest italic">
                  "Start Small, Grow Smart — Digital Assets for Every African"
                </p>
              </div>

              {/* Venture Links */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-4">Our Ventures</p>
                <div className="flex flex-col gap-2">
                  {[
                    { name: 'TechAfrik', href: 'https://techafrik.rpnmore.com' },
                    { name: 'Dobuygoods', href: 'https://dobuygoods.rpnmore.com' },
                    { name: 'SignupGhana', href: 'https://signupghana.rpnmore.com' },
                    { name: 'Biskaken', href: 'https://biskakenauto.rpnmore.com' },
                    { name: 'ResearchClaw', href: 'https://researchclaw.rpnmore.com' },
                  ].map(v => (
                    <a key={v.name} href={v.href} target="_blank" rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#F5A623] transition-colors text-sm font-medium">
                      {v.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-4">Quick Links</p>
                <div className="flex flex-col gap-2">
                  {['Home', 'About', 'Ventures', 'Blog', 'Contact'].map(link => (
                    <a key={link} href={`#${link.toLowerCase()}`}
                      className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                      {link}
                    </a>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-4">Follow Us</p>
                <div className="flex flex-col gap-2">
                  {[
                    { name: 'Twitter / X', href: 'https://twitter.com/rpnmore' },
                    { name: 'Instagram', href: 'https://instagram.com/rpnmore' },
                    { name: 'LinkedIn', href: 'https://linkedin.com/company/rpnmore' },
                  ].map(s => (
                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#F5A623] transition-colors text-sm font-medium">
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-zinc-600 text-sm">© 2026 Ripple & More Limited. All Rights Reserved.</p>
              <button
                onClick={toggleAdmin}
                className="flex items-center gap-2 text-zinc-600 hover:text-[#F5A623] transition-colors text-xs"
              >
                {isAdmin ? <Unlock size={12} /> : <Lock size={12} />}
                {isAdmin ? 'Admin Mode On' : 'Admin Login'}
              </button>
            </div>
          </div>
        </footer>
        <AiChat />
      </div>
    </Router>
  );
}
