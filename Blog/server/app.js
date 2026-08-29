require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const { connectDB } = require('./config/db');

// Routes
const authRoutes         = require('./routes/auth');
const postRoutes         = require('./routes/posts');
const categoryRoutes     = require('./routes/categories');
const commentRoutes      = require('./routes/comments');
const reactionRoutes     = require('./routes/reactions');
const notificationRoutes = require('./routes/notifications');
const userRoutes         = require('./routes/users');
const searchRoutes       = require('./routes/search');
const analyticsRoutes    = require('./routes/analytics');
const adminRoutes        = require('./routes/admin');
const settingsRoutes     = require('./routes/settings');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5180',
  process.env.ADMIN_URL    || 'http://localhost:5050',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5180',
  'http://localhost:8080',
  'https://sholok.vercel.app',
].filter(Boolean);

// Stub socket.io so routes that call req.app.get('io').emit(...) don't crash
app.set('io', { emit() {}, to() { return { emit() {} }; } });

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'blob:', 'https:', 'http:'],
      connectSrc:  ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
      mediaSrc:    ["'self'", 'blob:', 'https:'],
      frameSrc:    ["'self'"],
      objectSrc:   ["'none'"],
    },
  },
}));
app.use(morgan('dev'));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
}));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin Panel — serve built React app at /admin
const adminDist = path.join(__dirname, 'public', 'admin');
app.use('/admin', express.static(adminDist));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDist, 'index.html'));
});

// Shared API router (mounted at both /api and /blog-api for cPanel compatibility)
const apiRouter = express.Router();
apiRouter.use('/auth',          authRoutes);
apiRouter.use('/posts',         postRoutes);
apiRouter.use('/categories',    categoryRoutes);
apiRouter.use('/comments',      commentRoutes);
apiRouter.use('/reactions',     reactionRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/users',         userRoutes);
apiRouter.use('/search',        searchRoutes);
apiRouter.use('/analytics',     analyticsRoutes);
apiRouter.use('/admin',         adminRoutes);
apiRouter.use('/settings',      settingsRoutes);

app.use('/api',      apiRouter);
app.use('/blog-api', apiRouter); // proxy alias used by frontend in dev + production

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Sholok Blog API is running (MySQL)', timestamp: new Date() });
});

// Serve frontend build at /blog (for cPanel — run: npm run build inside frontend)
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use('/blog', express.static(frontendDist));
app.get('/blog/*', (req, res) => {
  const idx = path.join(frontendDist, 'index.html');
  res.sendFile(idx, (err) => {
    if (err) res.status(404).json({ success: false, message: 'Frontend not built yet.' });
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// On startup: fix any emoji icons corrupted by charset mismatch at first seed
const { pool: _pool } = require('./config/db');
const _iconFixes = [
  { slug: 'entertainment',  icon: '🎨' }, // 🎨
  { slug: 'lifestyle',      icon: '🛍️' }, // 🛍️
  { slug: 'hobbies-travel', icon: '🧭' }, // 🧭
  { slug: 'knowledge',      icon: '🧠' }, // 🧠
];
connectDB()
  .then(async () => {
    for (const { slug, icon } of _iconFixes) {
      await _pool.execute('UPDATE categories SET icon = ? WHERE slug = ?', [icon, slug]);
    }
  })
  .catch((err) => {
    console.error('❌ Could not connect to MySQL on startup:', err.message);
  });

module.exports = app;
