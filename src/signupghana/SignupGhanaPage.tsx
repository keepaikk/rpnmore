/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  ExternalLink, 
  Zap, 
  Layers, 
  Award, 
  Clock, 
  Smartphone,
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Project } from './types';

const WHATSAPP_NUMBER = "233502213824"; // Example Ghana number
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20SignupGhana,%20I%20want%20branding%20services.`;

// Utility to format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

interface ProjectCardProps {
  project: Project;
  key?: string | number;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="glass rounded-2xl overflow-hidden group relative flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={project.image_url} 
          alt={project.caption}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-brand-primary text-black rounded-full shadow-lg">
            {project.tag}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-medium text-white mb-2 line-clamp-2 leading-tight">
            {project.caption}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} className="text-brand-primary" />
            <span>{formatRelativeTime(project.created_at)}</span>
          </div>
          <motion.a 
            href={WHATSAPP_URL}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/10 rounded-full hover:bg-brand-primary hover:text-black transition-colors"
          >
            <MessageCircle size={16} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="flex justify-between items-center pt-4">
          <div className="h-3 bg-white/5 rounded w-20" />
          <div className="h-8 w-8 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function SignupGhanaPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [heroBg, setHeroBg] = useState<string>("");

  const fetchData = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const [projectsRes, settingsRes] = await Promise.all([
        fetch('/api/sg/projects'),
        fetch('/api/sg/settings')
      ]);
      
      const [projectsData, settingsData] = await Promise.all([
        projectsRes.json(),
        settingsRes.json()
      ]);
      
      setProjects(projectsData);
      setHeroBg(settingsData.hero_bg_image);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-black">
      {/* Hero Background Image (Fixed/Absolute) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <AnimatePresence>
          {heroBg && (
            <motion.div
              key={heroBg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img 
                src={heroBg} 
                alt="Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-transparent to-brand-bg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating WhatsApp */}
      <motion.a
        href={WHATSAPP_URL}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-2xl shadow-green-500/20 flex items-center gap-2 group"
      >
        <MessageCircle size={24} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-medium">
          Chat with us
        </span>
      </motion.a>

      {/* Header/Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SignupGhana</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#feed" className="hover:text-white transition-colors">Projects</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#about" className="hover:text-white transition-colors">Trust</a>
          </div>
          <a 
            href={WHATSAPP_URL}
            className="px-5 py-2 rounded-full border border-white/20 hover:border-brand-primary hover:text-brand-primary transition-all text-sm font-medium"
          >
            Get a Quote
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
           <div className="absolute top-0 inset-x-0 h-96 bg-brand-primary/30 blur-[120px] rounded-full" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              ACTIVE WORK FEED
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[0.9]">
              Branding That <br />
              <span className="text-gradient">Speaks for Itself</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Premium signage, LED solutions, and brand identities for Ghana's boldest businesses. No fluff, just real work updated daily.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="#feed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-black font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                View Latest Projects <LayoutGrid size={18} />
              </motion.a>
              <motion.a
                href={WHATSAPP_URL}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 font-bold rounded-2xl flex items-center justify-center gap-2 border border-white/10"
              >
                Chat on WhatsApp <MessageCircle size={18} />
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white/[0.02] border-y border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60">
           <div className="flex items-center gap-3">
             <ShieldCheck className="text-brand-primary" />
             <span className="text-sm font-medium">Trusted by 50+ Ghana SMEs</span>
           </div>
           <div className="flex items-center gap-3">
             <Award className="text-brand-primary" />
             <span className="text-sm font-medium">Award-winning Signage Works</span>
           </div>
           <div className="flex items-center gap-3">
             <TrendingUp className="text-brand-primary" />
             <span className="text-sm font-medium">Fast Production & Setup</span>
           </div>
           <div className="flex items-center gap-3">
             <Smartphone className="text-brand-primary" />
             <span className="text-sm font-medium">Delivered Across all 16 Regions</span>
           </div>
        </div>
      </section>

      {/* Live Feed Section */}
      <section id="feed" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-brand-primary mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-bold tracking-widest uppercase">Live Project Stream</span>
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight">Our Recent Work</h2>
            </div>
            <div className="flex items-center gap-4">
              {isRefreshing && (
                <span className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={14} className="animate-spin" /> Fetching latest...
                </span>
              )}
              <button 
                onClick={() => fetchData()}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                Refresh <Zap size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              ) : (
                projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-16 text-center">
            <button className="px-8 py-4 glass hover:bg-white/10 rounded-2xl text-sm font-bold transition-all text-gray-300">
              Show More Archive
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="font-display text-4xl font-bold mb-4">What We Do</h2>
             <p className="text-gray-400 max-w-xl mx-auto">Expert execution from concept to installation.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <LayoutGrid />, title: "3D Signage", desc: "Acrylic, Metal & LED" },
              { icon: <Zap />, title: "LED Advertising", desc: "Digital Billboards" },
              { icon: <Layers />, title: "Brand Identity", desc: "Logo & UI Design" },
              { icon: <ImageIcon />, title: "Corporate Merch", desc: "Premium Branding" },
            ].map((service, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass p-8 rounded-3xl text-center flex flex-col items-center group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-black transition-colors">
                  {service.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-brand-primary/10 blur-[150px] opacity-20" />
        <div className="max-w-3xl mx-auto text-center relative z-10 glass p-12 md:p-20 rounded-[3rem]">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight">
            Want Your Business to <br /> Stand Out Like This?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Let's discuss your next project. Professional consultation and fast delivery anywhere in Ghana.
          </p>
          <motion.a
            href={WHATSAPP_URL}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-black font-black text-lg rounded-2xl shadow-xl shadow-brand-primary/20"
          >
            Start WhatsApp Chat <MessageCircle size={22} fill="currentColor" />
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <Zap size={14} />
            </div>
            <span className="font-display font-bold text-gray-300">SignupGhana</span>
          </div>
          <p>© {new Date().getFullYear()} SignupGhana Branding Agency. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
