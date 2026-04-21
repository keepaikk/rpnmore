import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import fs from "fs";

// Import database
import { initializeDatabase, checkDatabaseHealth, closePool } from "./db/index.js";

// Import routes
import blogRoutes from "./routes/blog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
} catch (e) {
  console.warn("firebase-applet-config.json not found or invalid — Firebase disabled");
}

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;
try {
  if (!admin.apps.length) {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
        console.log("Firebase Admin: using service account from env");
      } catch (e) {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY is invalid JSON, falling back to applicationDefault()");
        credential = admin.credential.applicationDefault();
      }
    } else {
      credential = admin.credential.applicationDefault();
    }
    admin.initializeApp({
      credential,
      projectId: firebaseConfig.projectId,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  }
  db = admin.firestore();
  console.log("Firebase Admin: initialized");
} catch (e) {
  console.warn("Firebase Admin init failed:", (e as Error).message);
}

// Canonical ventures
const VENTURES = [
  {
    id: 'techafrik',
    title: 'TechAfrik',
    description: 'AI & Blockchain Media for Africa. Delivering tech education, news, and insights across Telegram, WhatsApp, TikTok, Instagram, LinkedIn & X.',
    category: 'Media & Education',
    icon: 'Cpu',
    externalLink: 'https://techafrik.rpnmore.com'
  },
  {
    id: 'dobuygoods',
    title: 'Dobuygoods',
    description: 'Buy & Sell. Pay with Crypto. A marketplace for used electronics and general goods — bridging African commerce with digital asset transactions.',
    category: 'Commerce',
    icon: 'ShoppingCart',
    externalLink: 'https://dobuygoods.rpnmore.com'
  },
  {
    id: 'signupghana',
    title: 'SignupGhana',
    description: 'Branding & Visual Marketing in Ghana. Complete brand identity, 3D signage, LED screen advertising, and corporate merchandise.',
    category: 'Branding',
    icon: 'Palette',
    externalLink: 'https://rpnmore.com/signupghana'
  },
  {
    id: 'biskaken',
    title: 'Biskaken Auto',
    description: 'Trusted Automotive Repair & Services. Professional, reliable, and expert vehicle maintenance — because not everything is digital, yet.',
    category: 'Automotive',
    icon: 'Wrench',
    externalLink: 'https://biskakenauto.rpnmore.com'
  },
  {
    id: 'researchclaw',
    title: 'ResearchClaw',
    description: 'AI-Powered Research & Automation. Agentic AI systems, social media automation at scale, and intelligent workflows across all our ventures.',
    category: 'AI & Automation',
    icon: 'Bot',
    externalLink: 'https://researchclaw.rpnmore.com'
  }
];

const PLACEHOLDER_SERVICES = VENTURES;
const PLACEHOLDER_POSTS: any[] = [];

// In-memory store for fallback
let memoryServices = [...PLACEHOLDER_SERVICES];
let memoryPosts = [...PLACEHOLDER_POSTS];
let memoryBackgrounds: string[] = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
];

// Database status
let dbInitialized = false;

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  // Redirect subdomains to their respective routes
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    
    // SignupGhana subdomain
    if (host.startsWith('signupghana.') || host.startsWith('www.signupghana.')) {
      const path = req.originalUrl === '/' ? '/signupghana' : `/signupghana${req.originalUrl}`;
      return res.redirect(301, `https://rpnmore.com${path}`);
    }
    
    // TechAfrik subdomain - redirect to venture page
    if (host.startsWith('techafrik.') || host.startsWith('www.techafrik.')) {
      return res.redirect(301, 'https://rpnmore.com/#techafrik');
    }
    
    next();
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite HMR
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://rpnmore.com', 
          'https://www.rpnmore.com', 
          'https://signupghana.rpnmore.com',
          'https://techafrik.rpnmore.com',
          'https://dobuygoods.rpnmore.com',
          'https://biskakenauto.rpnmore.com',
          'https://researchclaw.rpnmore.com'
        ]
      : true,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize PostgreSQL
  dbInitialized = await initializeDatabase();
  if (dbInitialized) {
    console.log('PostgreSQL database initialized successfully');
  }

  // Admin password verification
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "rpnmore-admin";
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  });

  // API Routes
  app.get("/api/db-status", async (_req, res) => {
    const status = {
      firebase: "placeholder",
      postgres: dbInitialized ? "connected" : "not configured",
    };

    try {
      if (db && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("TODO")) {
        await db.collection("health").doc("check").set({ lastCheck: new Date() });
        status.firebase = "connected";
      }
    } catch (err) {
      status.firebase = "placeholder";
    }

    // Get actual database health
    const pgHealth = await checkDatabaseHealth();
    status.postgres = pgHealth.status;

    res.json(status);
  });

  // Mount blog routes (priority over legacy routes)
  app.use("/api/blog", blogRoutes);

  // SignupGhana API
  const sgProjects = [
    {
      id: "1",
      image_url: "https://picsum.photos/seed/sgsign1/800/600",
      caption: "3D Acrylic Signage – East Legon",
      tag: "Signage",
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "2",
      image_url: "https://picsum.photos/seed/sgled1/800/600",
      caption: "LED Billboard Installation – Accra Mall",
      tag: "LED",
      created_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    },
    {
      id: "3",
      image_url: "https://picsum.photos/seed/sgbrand1/800/600",
      caption: "Corporate Rebranding – Osu",
      tag: "Branding",
      created_at: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
    },
    {
      id: "4",
      image_url: "https://picsum.photos/seed/sgmerch1/800/600",
      caption: "Custom Staff Merchandise – Kumasi",
      tag: "Merchandise",
      created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    },
    {
      id: "5",
      image_url: "https://picsum.photos/seed/sgneon1/800/600",
      caption: "Neon Signage – Labone",
      tag: "Signage",
      created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    },
    {
      id: "6",
      image_url: "https://picsum.photos/seed/sgbrand2/800/600",
      caption: "Vehicle Branding – Airport City",
      tag: "Branding",
      created_at: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    }
  ];

  const sgSettings = {
    hero_bg_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  };

  app.get("/api/sg/projects", (_req, res) => {
    const now = Date.now();
    const dynamicProjects = sgProjects.map((p, index) => {
      const offsets = [15, 65, 125, 300, 1440, 2880];
      return {
        ...p,
        created_at: new Date(now - 1000 * 60 * offsets[index % 6]).toISOString()
      };
    });
    const sorted = [...dynamicProjects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(sorted);
  });

  app.get("/api/sg/settings", (_req, res) => {
    res.json(sgSettings);
  });

  // Legacy Services API (for backward compatibility)
  app.get("/api/services", async (_req, res) => {
    try {
      if (db && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("TODO")) {
        const snapshot = await db.collection("services").get();
        if (!snapshot.empty) {
          return res.json(snapshot.docs.map(doc => doc.data()));
        }
      }
      res.json(memoryServices);
    } catch (err) {
      res.json(memoryServices);
    }
  });

  app.post("/api/services", async (req, res) => {
    const services = req.body;
    memoryServices = services;
    
    try {
      if (db) {
        const batch = db.batch();
        services.forEach((s: any) => {
          const ref = db!.collection("services").doc(s.id);
          batch.set(ref, s);
        });
        await batch.commit();
      }
    } catch (err) {
      console.log("Save to DB skipped (Saved to Memory)");
    }
    res.json({ success: true });
  });

  // Legacy Posts API (redirects to blog routes for compatibility)
  app.get("/api/posts", async (_req, res) => {
    try {
      // Use new blog routes
      const response = await fetch(`http://localhost:${PORT}/api/blog/posts?limit=100`);
      const data = await response.json();
      return res.json(data.posts || []);
    } catch (err) {
      res.json(memoryPosts);
    }
  });

  app.post("/api/posts", async (req, res) => {
    const post = req.body;
    memoryPosts = [post, ...memoryPosts];
    
    try {
      if (db) await db.collection("posts").doc(post.id).set(post);
    } catch (err) {
      console.log("Save post to DB skipped (Saved to Memory)");
    }
    res.json({ success: true });
  });

  app.delete("/api/posts/:id", async (req, res) => {
    const { id } = req.params;
    memoryPosts = memoryPosts.filter(p => p.id !== id);
    try {
      if (db) await db.collection("posts").doc(id).delete();
    } catch (err) {
      console.log("Delete post from DB skipped");
    }
    res.json({ success: true });
  });

  // Backgrounds API
  const uploadsDir = path.join(process.cwd(), 'uploads', 'backgrounds');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/api/home-backgrounds', async (_req, res) => {
    try {
      if (db) {
        const doc = await db.collection('config').doc('home-backgrounds').get();
        if (doc.exists) {
          const data = doc.data();
          if (data?.urls?.length) return res.json({ urls: data.urls });
        }
      }
    } catch {}
    res.json({ urls: memoryBackgrounds });
  });

  app.post('/api/home-backgrounds', async (req, res) => {
    const { urls, images } = req.body;

    if (Array.isArray(images) && images.length > 0) {
      const savedUrls: string[] = [];
      for (const img of images) {
        const matches = img.data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches) continue;
        const ext = matches[1].split('/')[1] || 'jpg';
        const filename = `bg-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filepath = path.join(process.cwd(), 'uploads', 'backgrounds', filename);
        fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
        savedUrls.push(`/uploads/backgrounds/${filename}`);
      }
      if (savedUrls.length > 0) {
        memoryBackgrounds = savedUrls;
        try { if (db) await db.collection('config').doc('home-backgrounds').set({ urls: savedUrls }); } catch {}
        return res.json({ success: true, urls: savedUrls });
      }
    }

    if (Array.isArray(urls) && urls.length > 0) {
      memoryBackgrounds = urls;
      try { if (db) await db.collection('config').doc('home-backgrounds').set({ urls }); } catch {}
      return res.json({ success: true, urls });
    }

    res.status(400).json({ error: 'Provide urls or images array' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await closePool();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await closePool();
    process.exit(0);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`PostgreSQL: ${dbInitialized ? 'Connected' : 'Not configured'}`);
    console.log(`Blog API: http://localhost:${PORT}/api/blog/posts`);
  });
}

startServer();