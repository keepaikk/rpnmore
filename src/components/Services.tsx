import { motion } from 'motion/react';
import { Service } from '../types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServicesProps {
  services: Service[];
}

const VENTURE_ICONS: Record<string, { emoji: string; color: string }> = {
  techafrik:    { emoji: '📱', color: '#F5A623' },
  dobuygoods:   { emoji: '🛒', color: '#00C2FF' },
  signupghana:  { emoji: '🎨', color: '#A855F7' },
  biskaken:     { emoji: '🔧', color: '#EF4444' },
  researchclaw: { emoji: '⚡', color: '#10B981' },
};

export default function Services({ services }: ServicesProps) {
  return (
    <section id="ventures" className="py-32 px-6 bg-white dark:bg-[#0D1426] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5A623]/30 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-[#F5A623] mb-4"
          >
            Everything We Build
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight leading-none mb-6"
          >
            UNDER ONE <span className="text-[#F5A623] italic">ROOF.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-zinc-600 dark:text-zinc-400 text-base font-normal"
          >
            Each venture is purpose-built for its market. Click to explore details.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const meta = VENTURE_ICONS[service.id] || { emoji: '🚀', color: '#F5A623' };
            const color = service.color || meta.color;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/venture/${service.id}`}
                  className="group relative p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03] transition-all duration-300 cursor-pointer block overflow-hidden"
                  style={{ ['--venture-color' as any]: color }}
                >
                  {/* Animated color glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                    style={{ background: `radial-gradient(circle at top left, ${color}15, transparent 70%)` }}
                  />
                  <div
                    className="absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: `${color}40` }}
                  />

                  <div className="relative">
                    {/* Number + category */}
                    <div className="flex items-start justify-between mb-6">
                      <span className="text-5xl">{meta.emoji}</span>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className="text-[10px] font-medium uppercase tracking-widest rounded-full px-3 py-1 border"
                          style={{ color, borderColor: `${color}40`, background: `${color}10` }}
                        >
                          {service.category}
                        </span>
                        <span className="text-xs font-medium text-zinc-300 dark:text-zinc-700">
                          0{i + 1}
                        </span>
                      </div>
                    </div>

                    <h3
                      className="text-xl font-semibold text-black dark:text-white transition-colors mb-2 leading-tight group-hover:text-current"
                      style={{ ['--tw-text-opacity' as any]: '1' }}
                    >
                      <span className="group-hover:text-[color:var(--venture-color)] transition-colors">
                        {service.title}
                      </span>
                    </h3>
                    {service.tagline && (
                      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color }}>
                        {service.tagline}
                      </p>
                    )}
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    <div
                      className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"
                      style={{ color }}
                    >
                      Explore {service.title} <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5A623]/30 to-transparent" />
    </section>
  );
}
