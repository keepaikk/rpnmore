import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ExchangeRateWidget } from './ExchangeRateWidget';
import { useState, useEffect, useRef } from 'react';

const ROTATING_WORDS = ['DIGITAL', 'CRYPTO', 'AI-DRIVEN', 'REAL'];

const FALLBACK_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState<string[]>(FALLBACK_BACKGROUNDS);
  const [bgIndex, setBgIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotating headline word
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % ROTATING_WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch backgrounds from API
  useEffect(() => {
    fetch('/api/home-backgrounds')
      .then(r => r.json())
      .then(data => { if (data.urls?.length) setBackgrounds(data.urls); })
      .catch(() => {}); // keep fallback
  }, []);

  // Auto-advance background every 9 seconds
  useEffect(() => {
    if (backgrounds.length < 2) return;
    timerRef.current = setInterval(() => {
      setBgIndex(i => (i + 1) % backgrounds.length);
    }, 9000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [backgrounds]);

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 bg-[#0A0F1E] overflow-hidden">

      {/* ── Background image slideshow ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AnimatePresence>
          {backgrounds.map((url, i) =>
            i === bgIndex ? (
              <motion.div
                key={url + i}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 0.35, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${url})`,
                  animation: 'heroZoom 18s ease-in-out infinite alternate',
                }}
              />
            ) : null
          )}
        </AnimatePresence>

        {/* Dark gradient overlay — improves text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/60 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
        <div className="absolute inset-0 bg-[#0A0F1E]/30" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(245,166,35,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.6) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Colour blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F5A623]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00C2FF]/10 rounded-full blur-[150px]" />
      </div>

      {/* Exchange Rate Widget - Positioned top-right on desktop */}
      <div className="absolute top-32 right-6 z-30 hidden xl:block">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <ExchangeRateWidget />
        </motion.div>
      </div>

      {/* Slide indicator dots */}
      {backgrounds.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setBgIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === bgIndex ? 'w-8 bg-[#F5A623]' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Background ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-8 hidden lg:flex items-center justify-center w-16 h-16 border border-[#F5A623]/30 rounded-2xl rotate-12 text-[#F5A623]/40 font-bold text-xl z-10"
      >₿</motion.div>
      <motion.div
        animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/3 right-8 hidden lg:flex items-center justify-center w-20 h-20 border border-[#00C2FF]/30 rounded-full text-[#00C2FF]/40 font-bold text-sm z-10"
      >AI</motion.div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-full mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#F5A623]">
            Start Small, Grow Smart — Digital Assets for Every African
          </span>
        </motion.div>

        {/* Headline */}
        <div className="overflow-hidden mb-4">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2"
          >
            <span className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none">
              BUILDING
            </span>
            <span className="relative text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none inline-block" style={{ minWidth: '5ch' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-[#F5A623]"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#00C2FF] leading-none">
              WEALTH.
            </span>
          </motion.div>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-2xl mx-auto text-lg text-white/70 mb-3 leading-relaxed"
        >
          One company. Multiple ventures. One mission.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-xl mx-auto text-base text-white/50 mb-12"
        >
          From crypto education to AI automation, e-commerce, branding, and automotive — built for Africa.
        </motion.p>

        {/* Exchange Rate Widget - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="xl:hidden mb-8"
        >
          <ExchangeRateWidget />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <a
            href="#ventures"
            className="w-full md:w-auto px-8 py-4 bg-[#F5A623] text-[#0A0F1E] font-semibold text-base rounded-2xl hover:bg-[#F5A623]/80 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#F5A623]/20"
          >
            EXPLORE OUR VENTURES <ArrowRight size={20} />
          </a>
          <a
            href="#contact"
            className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/15 text-white font-semibold text-base rounded-2xl hover:bg-[#00C2FF]/10 hover:border-[#00C2FF]/30 transition-all"
          >
            GET STARTED
          </a>
        </motion.div>

        {/* Venture pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-16"
        >
          {[
            { name: 'TechAfrik', color: '#F5A623', id: 'techafrik' },
            { name: 'Dobuygoods', color: '#00C2FF', id: 'dobuygoods' },
            { name: 'SignupGhana', color: '#A855F7', id: 'signupghana' },
            { name: 'Biskaken', color: '#EF4444', id: 'biskaken' },
            { name: 'ResearchClaw', color: '#10B981', id: 'researchclaw' },
          ].map((v, i) => (
            <motion.a
              key={v.name}
              href={`/venture/${v.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="px-4 py-2 rounded-full border bg-white/5 text-xs font-medium uppercase tracking-widest transition-all hover:scale-105 hover:bg-white/10"
              style={{ color: v.color, borderColor: `${v.color}30` }}
            >
              {v.name}
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* CSS for slow zoom keyframe */}
      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
      `}</style>
    </section>
  );
}
