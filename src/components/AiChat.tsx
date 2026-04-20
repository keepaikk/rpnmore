import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, RotateCcw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `You are RippleAI — the intelligent assistant for Ripple & More Limited, a digital asset and technology company founded in Ghana, operating across Africa, UAE.

Contact: Phone/WhatsApp: +233 598 919 014 | WhatsApp Channel: https://chat.whatsapp.com/B99AHfBj97o7BtqmtEUQR2 | Email: info@rpnmore.com

You know everything about Ripple & More and its 5 ventures:

1. **TechAfrik** — AI & Blockchain Media for Africa. Daily crypto and AI education across Telegram, WhatsApp, TikTok, Instagram, LinkedIn, and X. Visit: techafrik.rpnmore.com

2. **Dobuygoods** — Crypto-powered marketplace. Buy and sell used electronics and goods using Bitcoin, USDT, and more. Africa-focused commerce meets digital assets. Visit: dbg.rpnmore.com

3. **SignupGhana** — Ghana's branding and visual marketing agency. 3D signage, LED advertising, brand identity, and corporate merchandise. Visit: signupghana.rpnmore.com

4. **Biskaken Auto** — Trusted automotive repair and services in Ghana. Engine diagnostics, maintenance, bodywork. One of the few auto shops accepting crypto payments. Visit: biskakenauto.rpnmore.com

5. **ResearchClaw** — AI automation engine. Builds agentic AI systems, social media automation at scale, and intelligent workflows powering all Ripple & More ventures. Visit: researchclaw.rpnmore.com

Company mission: "Start Small, Grow Smart — Digital Assets for Every African"
Headquarters: Founded in Ghana, operating across Africa. Serving Africa and the GCC.

Be helpful, concise, and conversational. Keep responses short (2-4 sentences max unless asked for detail). Use a confident, modern tone. Always stay on topic about Ripple & More, digital wealth, crypto, AI, and Africa tech. If asked something unrelated, gently steer back. Never make up URLs beyond what's listed above.`;

const SUGGESTED = [
  'What is Ripple & More?',
  'Tell me about TechAfrik',
  'How can I pay with crypto?',
  'How do I contact you?',
];

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.0-flash',
        history: history.slice(0, -1),
        config: { systemInstruction: SYSTEM_PROMPT },
      });

      const res = await chat.sendMessage({ message: text.trim() });
      setMessages(prev => [...prev, { role: 'assistant', text: res.text || '' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I ran into an issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-[#F5A623] text-[#0A0F1E] shadow-2xl shadow-[#F5A623]/30 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sparkles size={22} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-3xl border border-white/10 bg-[#0D1426] shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F5A623] flex items-center justify-center">
                  <Sparkles size={14} className="text-[#0A0F1E]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-white text-sm tracking-tight">RippleAI</p>
                  <p className="text-[10px] text-[#F5A623] font-bold uppercase tracking-widest">Ask me anything</p>
                </div>
              </div>
              {messages.length > 0 && (
                <button onClick={reset} className="text-zinc-600 hover:text-zinc-400 transition-colors p-1">
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-zinc-400 text-sm text-center pt-2">
                    Hi! I'm RippleAI. Ask me about our ventures, crypto, AI, or digital wealth.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTED.map(s => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-xs px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-zinc-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] hover:bg-[#F5A623]/5 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#F5A623] text-[#0A0F1E] font-medium rounded-br-sm'
                            : 'bg-white/5 text-zinc-200 rounded-bl-sm border border-white/5'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#F5A623]"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/5">
              <form
                onSubmit={e => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-[#F5A623]/40 transition-colors"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about our ventures..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-[#F5A623] text-[#0A0F1E] flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-[#F5A623]/80 shrink-0"
                >
                  <Send size={13} strokeWidth={2.5} />
                </button>
              </form>
              <p className="text-[10px] text-zinc-700 text-center mt-2">Powered by Gemini · Ripple & More</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
