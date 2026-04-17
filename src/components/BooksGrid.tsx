import { motion } from 'motion/react';
import { Book } from '../types';

interface BooksGridProps {
  books: Book[];
}

export default function BooksGrid({ books }: BooksGridProps) {
  return (
    <section id="books" className="py-32 px-6 bg-white dark:bg-[#0D1426] transition-colors duration-300 relative overflow-hidden">
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
            Digital Knowledge
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight leading-none mb-6"
          >
            BOOKS & <span className="text-[#F5A623] italic">DIGITAL PRODUCTS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-zinc-600 dark:text-zinc-400 text-base font-normal"
          >
            Practical guides, frameworks, and insights to help you navigate digital assets, AI, and building wealth in Africa.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-3xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03] overflow-hidden transition-all duration-300 hover:border-[#F5A623]/30"
            >
              {/* Book Cover */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#F5A623]/20 to-[#0A0F1E]/40">
                <picture>
                  {/* WebP with responsive sizes */}
                  <source
                    type="image/webp"
                    srcSet={book.coverWebpSrcset}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Fallback to original */}
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                    width="400"
                    height="533"
                  />
                </picture>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/60 via-transparent to-transparent" />
                {/* Price badge */}
                <div className="absolute top-4 right-4 bg-[#F5A623] text-[#0A0F1E] font-bold text-sm px-3 py-1 rounded-full">
                  {book.price}
                </div>
              </div>

              {/* Book Info */}
              <div className="p-6">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#F5A623] mb-2 block">
                  {book.category}{book.author && <span className="text-[10px] text-zinc-500 ml-2">by {book.author}</span>}
                </span>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2 leading-tight group-hover:text-[#F5A623] transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  {book.description}
                </p>

                <a
                  href={book.gumroadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#F5A623] text-[#0A0F1E] font-semibold rounded-xl hover:bg-[#F5A623]/80 transition-all text-sm"
                >
                  Buy Now on Gumroad
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-zinc-500">
            More books and digital products coming soon.{' '}
            <a href="#contact" className="text-[#F5A623] hover:underline">
              Get notified when new releases drop →
            </a>
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5A623]/30 to-transparent" />
    </section>
  );
}
