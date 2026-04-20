import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const VENTURES = [
  { name: 'TechAfrik', href: 'https://techafrik.rpnmore.com', tag: 'AI & Blockchain Media' },
  { name: 'Dobuygoods', href: 'https://dbg.rpnmore.com', tag: 'Crypto Commerce' },
  { name: 'SignupGhana', href: 'https://signupghana.rpnmore.com', tag: 'Branding & Signage' },
  { name: 'Biskaken', href: 'https://biskakenauto.rpnmore.com', tag: 'Auto Services' },
  { name: 'ResearchClaw', href: 'https://researchclaw.rpnmore.com', tag: 'AI Automation' },
];

export default function Navbar({ isDark }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [venturesOpen, setVenturesOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300",
      isDark ? "bg-[#0A0F1E]/90 border-white/10" : "bg-white/90 border-black/10"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-[#F5A623] rounded-lg flex items-center justify-center">
            <span className="text-[#0A0F1E] font-black text-lg">R</span>
          </div>
          <div className="leading-tight">
            <span className={cn(
              "text-lg font-bold tracking-tight block transition-colors",
              isDark ? "text-white" : "text-[#0A0F1E]"
            )}>Ripple & More</span>
            <span className="text-[10px] font-medium tracking-widest text-[#F5A623] uppercase">Limited</span>
          </div>
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'About', 'Blog', 'Books', 'Contact'].map((item, i) => (
            <motion.a
              key={item}
              href={item === 'Home' ? '/' : item === 'Books' ? '/books' : `#${item.toLowerCase()}`}
              onClick={item === 'Home' ? (e: React.MouseEvent) => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); } : item === 'Books' ? (e: React.MouseEvent) => { e.preventDefault(); navigate('/books'); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "text-sm font-medium transition-colors",
                isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-[#0A0F1E]"
              )}
            >
              {item}
            </motion.a>
          ))}

          {/* Ventures Dropdown */}
          <div className="relative" onMouseEnter={() => setVenturesOpen(true)} onMouseLeave={() => setVenturesOpen(false)}>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-1",
                isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-[#0A0F1E]"
              )}
            >
              Our Ventures <ChevronDown size={14} className={cn("transition-transform", venturesOpen && "rotate-180")} />
            </motion.button>

            <AnimatePresence>
              {venturesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56"
                >
                  <div className={cn(
                    "rounded-2xl border p-2 shadow-xl",
                    isDark ? "bg-[#0A0F1E] border-white/10" : "bg-white border-black/10"
                  )}>
                    {VENTURES.map(v => (
                      <a
                        key={v.name}
                        href={v.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex flex-col px-4 py-3 rounded-xl transition-colors group",
                          isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                        )}
                      >
                        <span className={cn("text-sm font-semibold group-hover:text-[#F5A623] transition-colors", isDark ? "text-white" : "text-[#0A0F1E]")}>{v.name}</span>
                        <span className="text-[11px] text-zinc-500">{v.tag}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.a
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-[#F5A623] text-[#0A0F1E] hover:bg-[#F5A623]/80 transition-colors"
          >
            Get Started →
          </motion.a>
        </div>

        {/* Mobile Toggle */}
        <button
          className={isDark ? "text-white" : "text-[#0A0F1E]"}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "md:hidden border-b px-6 py-8 flex flex-col gap-6 transition-colors",
              isDark ? "bg-[#0A0F1E] border-white/10" : "bg-white border-black/10"
            )}
          >
            {['Home', 'About', 'Blog', 'Books', 'Contact'].map(item => (
              <a
                key={item}
                href={item === 'Home' ? '/' : item === 'Books' ? '/books' : `#${item.toLowerCase()}`}
                className={cn("text-xl font-medium", isDark ? "text-white" : "text-[#0A0F1E]")}
                onClick={(e) => {
                  setIsOpen(false);
                  if (item === 'Home') { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                  if (item === 'Books') { e.preventDefault(); navigate('/books'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                }}
              >
                {item}
              </a>
            ))}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-3">Our Ventures</p>
              {VENTURES.map(v => (
                <a
                  key={v.name}
                  href={v.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("block py-2 text-lg font-medium", isDark ? "text-zinc-300" : "text-zinc-700")}
                  onClick={() => setIsOpen(false)}
                >
                  {v.name}
                </a>
              ))}
            </div>
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 font-semibold rounded-xl text-center block bg-[#F5A623] text-[#0A0F1E]"
            >
              Get Started →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
