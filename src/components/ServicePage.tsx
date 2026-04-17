import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, CheckCircle2, Zap } from 'lucide-react';
import { Service } from '../types';

interface ServicePageProps {
  services: Service[];
}

const VENTURE_META: Record<string, { emoji: string; bgPattern: string }> = {
  techafrik:    { emoji: '📱', bgPattern: 'crypto' },
  dobuygoods:   { emoji: '🛒', bgPattern: 'grid' },
  signupghana:  { emoji: '🎨', bgPattern: 'dots' },
  biskaken:     { emoji: '🔧', bgPattern: 'lines' },
  researchclaw: { emoji: '⚡', bgPattern: 'neural' },
};

export default function ServicePage({ services }: ServicePageProps) {
  const { id } = useParams();
  const service = services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center text-white">
        <p className="text-6xl mb-6">404</p>
        <h1 className="text-2xl font-bold mb-4">Venture Not Found</h1>
        <Link to="/" className="text-[#F5A623] hover:underline font-semibold">← Return Home</Link>
      </div>
    );
  }

  const meta = VENTURE_META[service.id] || { emoji: '🚀', bgPattern: 'dots' };
  const color = service.color || '#F5A623';

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">

      {/* Hero section */}
      <div className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(${color}80 1px, transparent 1px), linear-gradient(90deg, ${color}80 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-[600px] opacity-20"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}40, transparent 70%)` }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-16 transition-colors font-medium text-sm group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Ripple & More
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Category tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
                style={{ borderColor: `${color}40`, background: `${color}10`, color }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                <span className="text-xs font-semibold uppercase tracking-widest">{service.category}</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-none"
              >
                {service.title}
              </motion.h1>

              {service.tagline && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-medium mb-6"
                  style={{ color }}
                >
                  {service.tagline}
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-400 text-base font-normal leading-relaxed mb-10 max-w-lg"
              >
                {service.longDescription || service.description}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                {service.externalLink && (
                  <a
                    href={service.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-[#0A0F1E] rounded-2xl hover:scale-105 transition-all shadow-xl"
                    style={{ background: color, boxShadow: `0 20px 60px ${color}30` }}
                  >
                    VISIT {service.title.toUpperCase()} <ExternalLink size={16} />
                  </a>
                )}
                <Link
                  to="/#ventures"
                  className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-2xl border border-white/10 text-white hover:border-white/30 hover:bg-white/5 transition-all"
                >
                  All Ventures
                </Link>
              </motion.div>
            </div>

            {/* Right — big emoji + glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 blur-[80px] opacity-30 rounded-full"
                  style={{ background: color }}
                />
                <motion.div
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative text-[180px] select-none"
                >
                  {meta.emoji}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features grid */}
      {service.features && service.features.length > 0 && (
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color }}>
                What We Offer
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                CORE <span style={{ color }}>CAPABILITIES</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-white/10 transition-all group"
                >
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0" style={{ color }} />
                  <span className="text-zinc-300 group-hover:text-white transition-colors font-medium">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional info */}
      {service.additionalInfo && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl border relative overflow-hidden"
              style={{ borderColor: `${color}20`, background: `${color}05` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
              />
              <div className="flex items-start gap-4">
                <Zap size={24} className="shrink-0 mt-1" style={{ color }} />
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color }}>About This Venture</h3>
                  <p className="text-zinc-400 leading-relaxed">{service.additionalInfo}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Other ventures */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-4">Ecosystem</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              VIEW LIVE PROJECTS <span className="text-[#F5A623] italic">→</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.filter(s => s.id !== service.id).map((s, i) => {
              const m = VENTURE_META[s.id] || { emoji: '🚀' };
              const c = s.color || '#F5A623';
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/venture/${s.id}`}
                    className="block p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-white/10 transition-all group text-center"
                  >
                    <span className="text-3xl mb-3 block">{m.emoji}</span>
                    <p className="font-semibold text-white group-hover:text-[color:var(--c)] transition-colors text-sm" style={{ ['--c' as any]: c }}>
                      {s.title}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">{s.category}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(ellipse at 50% 100%, ${color}, transparent 70%)` }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color }}
          >
            Part of Ripple & More Limited
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-none"
          >
            READY TO BUILD <br /><span style={{ color }}>DIGITAL WEALTH?</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {service.externalLink && (
              <a
                href={service.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 font-semibold text-[#0A0F1E] rounded-2xl hover:scale-105 transition-all"
                style={{ background: color }}
              >
                Get Started with {service.title}
              </a>
            )}
            <Link
              to="/"
              className="px-8 py-4 font-semibold rounded-2xl border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
