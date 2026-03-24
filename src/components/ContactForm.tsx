import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all font-normal";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    // Send via mailto as fallback (no backend needed)
    try {
      const subject = encodeURIComponent(form.subject || `Message from ${form.name}`);
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
      window.open(`mailto:info@rpnmore.com?subject=${subject}&body=${body}`);
      setTimeout(() => setStatus('sent'), 500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status === 'sent' ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center py-12 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
            <CheckCircle size={32} className="text-[#F5A623]" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white">Message Sent!</h3>
          <p className="text-sm text-zinc-500 max-w-xs">Thanks for reaching out. We'll get back to you within 24 hours.</p>
          <button
            onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}
            className="mt-4 text-sm font-semibold text-[#F5A623] hover:underline"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 block">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 block">Subject</label>
            <select
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select a topic...</option>
              <option>Partnership Inquiry</option>
              <option>TechAfrik — Media &amp; Education</option>
              <option>Dobuygoods — Marketplace</option>
              <option>SignupGhana — Branding</option>
              <option>Biskaken Auto — Services</option>
              <option>ResearchClaw — AI Automation</option>
              <option>General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 block">Message</label>
            <textarea
              placeholder="Tell us how we can help..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className={`${inputClass} resize-none`}
              rows={5}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-4 bg-[#F5A623] text-[#0A0F1E] font-semibold rounded-xl hover:bg-[#F5A623]/80 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#F5A623]/20 text-sm"
          >
            {status === 'sending' ? 'Opening Mail...' : <><Send size={15} /> Send Message</>}
          </button>
          <p className="text-xs text-zinc-500 text-center">We respond within 24 hours · No spam ever</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
