import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Rate limiting middleware
import { 
  generalLimiter, 
  authLimiter, 
  passwordResetLimiter, 
  adminLimiter, 
  aiLimiter 
} from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
// Payments/downloads/webhooks removed for ad-supported model
import expressionRoutes from './routes/expression.js';
import journeyRoutes from './routes/journey.js';
// NEW: Enhanced journal and premium routes
import journalRoutes from './routes/journal.js';
import premiumRoutes from './routes/premium.js';
// NEW: Unlock routes (chapters, journal access, PDF downloads)
import unlockRoutes from './routes/unlocks.js';
// NEW: Admin dashboard routes (PROTECTED)
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import aiGenerateRoutes from './routes/ai-generate.js';
// NEW: User progress routes (chapter reflections)
import progressRoutes from './routes/progress.js';
// PDF download routes
import downloadRoutes from './routes/downloads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Security Headers ──
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Prevent caching of API responses
  if (_req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  next();
});

// Request logging
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ── Apply general rate limiting to all API routes ──
app.use('/api/', generalLimiter);

// ── API Routes with specific rate limiters ──
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/expression', expressionRoutes);
app.use('/api/journey', journalRoutes);
// NEW: Enhanced journal and premium routes
app.use('/api/journal', journalRoutes);
app.use('/api/premium', premiumRoutes);
// NEW: Unlock routes (chapters, journal access, PDF downloads)
app.use('/api/unlocks', unlockRoutes);
// NEW: Admin dashboard routes (PROTECTED - requires admin role)
app.use('/api/admin', adminLimiter, adminRoutes);
// Client-facing routes (messaging, ideas)
app.use('/api/client', clientRoutes);
// AI generation routes (admin only) - with AI rate limiter
app.use('/api/admin/ai', aiLimiter, aiGenerateRoutes);
// User progress routes (chapter reflections)
app.use('/api/progress', progressRoutes);
// PDF download routes
app.use('/api/downloads', downloadRoutes);

// ── Email subscription (simple) ──
import db from './db.js';

app.post('/api/subscribe', express.json(), (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    db.prepare('INSERT OR IGNORE INTO email_subscribers (email, source) VALUES (?, ?)')
      .run(email.toLowerCase().trim(), 'website');
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve static files in production ──
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Start server ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   DELTA EBooks API Server            ║`);
  console.log(`  ║   Running on port ${PORT}               ║`);
  console.log(`  ║   Mode: ${process.env.NODE_ENV || 'development'}             ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});

export default app;
