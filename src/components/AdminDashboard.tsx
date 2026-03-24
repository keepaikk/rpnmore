import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Trash2, X, Database, Cloud, AlertCircle, Edit2, Cpu, FileText, Image as ImageIcon } from 'lucide-react';
import { Service, BlogPost } from '../types';
import { cn } from '../lib/utils';
import {
  TEXT_MODELS, IMAGE_MODELS,
  getTextModel, getImageModel, setTextModel, setImageModel
} from '../services/geminiService';

interface AdminDashboardProps {
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
  posts: BlogPost[];
  onAddPost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
}

const ICON_OPTIONS = [
  'Layout', 'Palette', 'Box', 'Gift', 'Package', 'Camera', 'Cpu', 'Monitor', 'ShoppingCart'
];

export default function AdminDashboard({ services, onUpdateServices, posts, onAddPost, onDeletePost }: AdminDashboardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Service | null>(null);
  const [dbStatus, setDbStatus] = useState<{ firebase: string; postgres: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'services' | 'posts' | 'backgrounds' | 'models'>('services');
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({ author: 'Ripple & More', tags: [] });
  const [postTagInput, setPostTagInput] = useState('');
  const [postStatus, setPostStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentTextModel, setCurrentTextModel] = useState(getTextModel);
  const [currentImageModel, setCurrentImageModel] = useState(getImageModel);
  const [modelSaved, setModelSaved] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    icon: 'Layout',
    category: 'General'
  });
  const [bgUrls, setBgUrls] = useState<string[]>(['', '']);
  const [bgStatus, setBgStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [bgLoadError, setBgLoadError] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/db-status');
        if (res.ok) setDbStatus(await res.json());
      } catch (err) {
        console.error('Failed to check DB status:', err);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/home-backgrounds')
      .then(r => r.json())
      .then(data => { if (data.urls?.length) setBgUrls(data.urls.slice(0, 2).concat(['', '']).slice(0, 2)); })
      .catch(() => {});
  }, []);

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditDraft({ ...service });
    setSaveStatus('idle');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
    setSaveStatus('idle');
  };

  const commitEdit = async () => {
    if (!editDraft) return;
    setSaveStatus('saving');
    const updated = services.map(s => s.id === editDraft.id ? editDraft : s);
    try {
      await onUpdateServices(updated);
      setSaveStatus('saved');
      setTimeout(() => {
        setEditingId(null);
        setEditDraft(null);
        setSaveStatus('idle');
      }, 800);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      onUpdateServices(services.filter(s => s.id !== id));
    }
  };

  const handleAdd = async () => {
    if (!newService.title || !newService.description) return;
    const id = newService.title.toLowerCase().replace(/\s+/g, '-');
    await onUpdateServices([...services, { ...newService, id } as Service]);
    setNewService({ icon: 'Layout', category: 'General' });
  };

  const saveModels = () => {
    setTextModel(currentTextModel);
    setImageModel(currentImageModel);
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const inputClass = "bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-3 text-black dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full";

  return (
    <div className="py-20 px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-black/5 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-black tracking-tighter text-black dark:text-white">ADMIN <span className="text-emerald-500 italic">DASHBOARD</span></h2>

          <div className="flex gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors",
              dbStatus?.firebase === 'connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
              dbStatus?.firebase === 'placeholder' ? "bg-blue-500/10 border-blue-500/20 text-blue-600" :
              "bg-red-500/10 border-red-500/20 text-red-600"
            )}>
              <Cloud size={14} />
              FIREBASE: {dbStatus?.firebase?.toUpperCase() || 'CHECKING...'}
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors",
              dbStatus?.postgres === 'connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
              dbStatus?.postgres === 'not configured' ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-500" :
              "bg-red-500/10 border-red-500/20 text-red-600"
            )}>
              <Database size={14} />
              POSTGRES: {dbStatus?.postgres?.toUpperCase() || 'CHECKING...'}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {(['services', 'posts', 'backgrounds', 'models'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl font-semibold text-sm uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-[#F5A623] text-[#0A0F1E] shadow-lg shadow-[#F5A623]/20"
                  : "bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
              {tab === 'services' ? 'Services' : tab === 'posts' ? `Blog Posts (${posts.length})` : tab === 'backgrounds' ? 'Hero Images' : 'AI Models'}
            </button>
          ))}
        </div>

        {dbStatus?.postgres === 'not configured' && activeTab === 'services' && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-600 text-sm font-medium">
            <AlertCircle size={18} />
            <span>PostgreSQL backup not configured. Add <strong>DATABASE_URL</strong> to enable data redundancy.</span>
          </div>
        )}

        {/* AI Models Tab */}
        {activeTab === 'models' && (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-none">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-black dark:text-white">
              <Cpu className="text-emerald-500" size={20} /> AI Model Settings
            </h3>
            <p className="text-zinc-500 text-sm mb-8">Choose which Gemini models to use for blog content and image generation. Settings are saved locally in your browser.</p>

            <div className="space-y-8">
              {/* Text Model */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  Text / Content Model
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {TEXT_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setCurrentTextModel(m.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border text-left transition-all",
                        currentTextModel === m.id
                          ? "bg-emerald-500/10 border-emerald-500/40 text-black dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-900 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/30"
                      )}
                    >
                      <div>
                        <p className="font-bold text-sm">{m.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono">{m.id}</p>
                      </div>
                      {currentTextModel === m.id && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Model */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  Image Generation Model
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {IMAGE_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setCurrentImageModel(m.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border text-left transition-all",
                        currentImageModel === m.id
                          ? "bg-emerald-500/10 border-emerald-500/40 text-black dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-900 border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/30"
                      )}
                    >
                      <div>
                        <p className="font-bold text-sm">{m.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono">{m.id}</p>
                      </div>
                      {currentImageModel === m.id && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveModels}
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                {modelSaved ? '✓ Models Saved!' : 'SAVE MODEL SETTINGS'}
              </button>
            </div>
          </div>
        )}

        {/* Backgrounds Tab */}
        {activeTab === 'backgrounds' && (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon size={20} className="text-[#F5A623]" />
              <h3 className="text-xl font-bold text-black dark:text-white">Hero Background Images</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-8">Set the two images that rotate in the homepage hero. Paste a URL or upload a file from your device.</p>

            <div className="space-y-8">
              {bgUrls.map((url, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Image {idx + 1}</p>

                  {/* Preview */}
                  {url && (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
                      <img src={url} alt={`Background ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/50 px-2 py-1 rounded-full">Preview</span>
                    </div>
                  )}

                  {/* URL input */}
                  <input
                    type="text"
                    placeholder="Paste image URL (https://...)"
                    className={inputClass}
                    value={url}
                    onChange={e => setBgUrls(prev => { const n = [...prev]; n[idx] = e.target.value; return n; })}
                  />

                  {/* File upload */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="px-4 py-2.5 rounded-xl border border-dashed border-black/20 dark:border-white/20 text-sm font-medium text-zinc-500 group-hover:border-[#F5A623]/50 group-hover:text-[#F5A623] transition-all">
                      Upload from device
                    </div>
                    <span className="text-xs text-zinc-400">JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const dataUrl = ev.target?.result as string;
                          setBgUrls(prev => { const n = [...prev]; n[idx] = dataUrl; return n; });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              ))}

              {bgLoadError && (
                <p className="text-sm text-red-500">{bgLoadError}</p>
              )}

              <button
                onClick={async () => {
                  setBgLoadError('');
                  const validUrls = bgUrls.filter(u => u.trim());
                  if (validUrls.length === 0) { setBgLoadError('Add at least one image URL or upload a file.'); return; }
                  setBgStatus('saving');

                  // Separate base64 uploads from plain URLs
                  const base64Images = validUrls.filter(u => u.startsWith('data:'));
                  const plainUrls = validUrls.filter(u => !u.startsWith('data:'));

                  try {
                    if (base64Images.length > 0) {
                      await fetch('/api/home-backgrounds', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ images: base64Images.map(data => ({ data })) }),
                      });
                    } else {
                      await fetch('/api/home-backgrounds', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ urls: plainUrls }),
                      });
                    }
                    setBgStatus('saved');
                    setTimeout(() => setBgStatus('idle'), 2500);
                  } catch {
                    setBgLoadError('Failed to save. Check server connection.');
                    setBgStatus('idle');
                  }
                }}
                disabled={bgStatus === 'saving'}
                className="w-full py-4 bg-[#F5A623] text-[#0A0F1E] font-semibold rounded-xl hover:bg-[#F5A623]/80 transition-all disabled:opacity-50 shadow-lg shadow-[#F5A623]/20 text-sm"
              >
                {bgStatus === 'saving' ? 'Saving...' : bgStatus === 'saved' ? '✓ Backgrounds Updated! Refresh homepage to see changes.' : 'SAVE BACKGROUNDS'}
              </button>
            </div>
          </div>
        )}

        {/* Blog Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-8">
            {/* New Post Form */}
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-none">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-black dark:text-white">
                <FileText className="text-[#F5A623]" size={20} /> Write a New Post
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Post Title *"
                  className={cn(inputClass, "md:col-span-2")}
                  value={newPost.title || ''}
                  onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Author (e.g. TechAfrik Team)"
                  className={inputClass}
                  value={newPost.author || ''}
                  onChange={e => setNewPost(p => ({ ...p, author: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  className={inputClass}
                  value={newPost.imageUrl || ''}
                  onChange={e => setNewPost(p => ({ ...p, imageUrl: e.target.value }))}
                />
                <textarea
                  placeholder="Short excerpt / summary *"
                  className={cn(inputClass, "md:col-span-2 h-20 resize-none")}
                  value={newPost.excerpt || ''}
                  onChange={e => setNewPost(p => ({ ...p, excerpt: e.target.value }))}
                />
                <textarea
                  placeholder="Full blog content (Markdown supported) *"
                  className={cn(inputClass, "md:col-span-2 h-48 resize-none font-mono text-sm")}
                  value={newPost.content || ''}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                />
                {/* Tags input */}
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {(newPost.tags || []).map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] text-xs font-semibold rounded-full">
                        {tag}
                        <button onClick={() => setNewPost(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tag) }))} className="hover:text-red-500 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag (press Enter)"
                      className={cn(inputClass, "flex-1")}
                      value={postTagInput}
                      onChange={e => setPostTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && postTagInput.trim()) {
                          e.preventDefault();
                          setNewPost(p => ({ ...p, tags: [...(p.tags || []), postTagInput.trim()] }));
                          setPostTagInput('');
                        }
                      }}
                    />
                    <button
                      onClick={() => { if (postTagInput.trim()) { setNewPost(p => ({ ...p, tags: [...(p.tags || []), postTagInput.trim()] })); setPostTagInput(''); }}}
                      className="px-4 py-2 bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] rounded-xl font-semibold text-sm hover:bg-[#F5A623]/20 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!newPost.title || !newPost.excerpt || !newPost.content) return;
                    setPostStatus('saving');
                    const post: BlogPost = {
                      id: Date.now().toString(),
                      title: newPost.title!,
                      excerpt: newPost.excerpt!,
                      content: newPost.content!,
                      imageUrl: newPost.imageUrl || `https://picsum.photos/seed/${Date.now()}/1280/720`,
                      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      author: newPost.author || 'Ripple & More',
                      tags: newPost.tags || [],
                    };
                    await onAddPost(post);
                    setNewPost({ author: 'Ripple & More', tags: [] });
                    setPostTagInput('');
                    setPostStatus('saved');
                    setTimeout(() => setPostStatus('idle'), 2000);
                  }}
                  disabled={!newPost.title || !newPost.excerpt || !newPost.content || postStatus === 'saving'}
                  className="md:col-span-2 py-4 bg-[#F5A623] text-[#0A0F1E] font-semibold rounded-xl hover:bg-[#F5A623]/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/20"
                >
                  {postStatus === 'saving' ? 'Publishing...' : postStatus === 'saved' ? '✓ Post Published!' : 'PUBLISH POST'}
                </button>
              </div>
            </div>

            {/* Existing posts */}
            <h3 className="text-xl font-bold text-black dark:text-white">Published Posts ({posts.length})</h3>
            <div className="grid grid-cols-1 gap-4">
              {posts.map(post => (
                <motion.div
                  key={post.id}
                  layout
                  className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none flex items-start gap-4"
                >
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-20 h-14 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {post.tags.map(t => (
                        <span key={t} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 bg-[#F5A623]/10 text-[#F5A623] rounded-full">{t}</span>
                      ))}
                    </div>
                    <h4 className="font-semibold text-black dark:text-white leading-snug line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{post.date} · {post.author}</p>
                  </div>
                  <button
                    onClick={() => { if (confirm('Delete this post?')) onDeletePost(post.id); }}
                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
              {posts.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">No posts yet. Write your first one above.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && <>{/* Add New Service */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl p-8 mb-12 shadow-sm dark:shadow-none">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-black dark:text-white">
            <Plus className="text-emerald-500" /> Add New Service
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Service Title *"
              className={inputClass}
              value={newService.title || ''}
              onChange={e => setNewService({ ...newService, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category"
              className={inputClass}
              value={newService.category || ''}
              onChange={e => setNewService({ ...newService, category: e.target.value })}
            />
            <textarea
              placeholder="Short Description *"
              className={cn(inputClass, "md:col-span-2 h-24 resize-none")}
              value={newService.description || ''}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
            />
            <textarea
              placeholder="Long Description (Markdown supported)"
              className={cn(inputClass, "md:col-span-2 h-32 resize-none")}
              value={newService.longDescription || ''}
              onChange={e => setNewService({ ...newService, longDescription: e.target.value })}
            />
            <input
              type="text"
              placeholder="Featured Image URL"
              className={cn(inputClass, "md:col-span-2")}
              value={newService.imageUrl || ''}
              onChange={e => setNewService({ ...newService, imageUrl: e.target.value })}
            />
            <input
              type="text"
              placeholder="External Link (optional)"
              className={cn(inputClass, "md:col-span-2")}
              value={newService.externalLink || ''}
              onChange={e => setNewService({ ...newService, externalLink: e.target.value })}
            />
            <textarea
              placeholder="Service Updates"
              className={cn(inputClass, "md:col-span-2 h-20 resize-none")}
              value={newService.updates || ''}
              onChange={e => setNewService({ ...newService, updates: e.target.value })}
            />
            <textarea
              placeholder="Additional Information"
              className={cn(inputClass, "md:col-span-2 h-20 resize-none")}
              value={newService.additionalInfo || ''}
              onChange={e => setNewService({ ...newService, additionalInfo: e.target.value })}
            />
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Select Icon</p>
              <div className="flex flex-wrap gap-3">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewService({ ...newService, icon })}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      newService.icon === icon
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-zinc-100 dark:bg-zinc-900 border-black/10 dark:border-white/10 text-zinc-500 hover:border-emerald-500/50"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newService.title || !newService.description}
              className="md:col-span-2 bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ADD SERVICE
            </button>
          </div>
        </div>

        {/* Manage Existing Services */}
        <h3 className="text-xl font-bold mb-6 text-black dark:text-white">Manage Services ({services.length})</h3>
        <div className="grid grid-cols-1 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-none">
              {editingId === service.id && editDraft ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    className={inputClass}
                    value={editDraft.title}
                    onChange={e => setEditDraft({ ...editDraft, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    className={inputClass}
                    value={editDraft.category}
                    onChange={e => setEditDraft({ ...editDraft, category: e.target.value })}
                  />
                  <textarea
                    placeholder="Short Description"
                    className={cn(inputClass, "md:col-span-2 h-24 resize-none")}
                    value={editDraft.description}
                    onChange={e => setEditDraft({ ...editDraft, description: e.target.value })}
                  />
                  <textarea
                    placeholder="Long Description (Markdown supported)"
                    className={cn(inputClass, "md:col-span-2 h-32 resize-none")}
                    value={editDraft.longDescription || ''}
                    onChange={e => setEditDraft({ ...editDraft, longDescription: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Featured Image URL"
                    className={cn(inputClass, "md:col-span-2")}
                    value={editDraft.imageUrl || ''}
                    onChange={e => setEditDraft({ ...editDraft, imageUrl: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="External Link (optional)"
                    className={cn(inputClass, "md:col-span-2")}
                    value={editDraft.externalLink || ''}
                    onChange={e => setEditDraft({ ...editDraft, externalLink: e.target.value })}
                  />
                  <textarea
                    placeholder="Service Updates"
                    className={cn(inputClass, "md:col-span-2 h-20 resize-none")}
                    value={editDraft.updates || ''}
                    onChange={e => setEditDraft({ ...editDraft, updates: e.target.value })}
                  />
                  <textarea
                    placeholder="Additional Information"
                    className={cn(inputClass, "md:col-span-2 h-20 resize-none")}
                    value={editDraft.additionalInfo || ''}
                    onChange={e => setEditDraft({ ...editDraft, additionalInfo: e.target.value })}
                  />
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button onClick={cancelEdit} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all">
                        <X size={16} /> Cancel
                      </button>
                      <button
                        onClick={commitEdit}
                        disabled={saveStatus === 'saving'}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-60"
                      >
                        <Save size={16} />
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                      </button>
                    </div>
                    {saveStatus === 'error' && (
                      <span className="text-red-500 text-sm font-medium">Save failed. Try again.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{service.category}</span>
                    <h4 className="text-2xl font-bold text-black dark:text-white mt-1">{service.title}</h4>
                    <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-1 line-clamp-2">{service.description}</p>
                    {service.imageUrl && (
                      <p className="text-xs text-zinc-400 mt-2 truncate max-w-sm">🖼 {service.imageUrl}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(service)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all text-black dark:text-white text-sm font-medium"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </>}
      </div>
    </div>
  );
}
