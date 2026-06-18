require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const commentRoutes = require('./routes/comments');
const reactionRoutes = require('./routes/reactions');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
  'http://localhost:8080',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth Rate Limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io
app.set('io', io);
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Sholok Blog API is running', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`\n🚀 Sholok Blog Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`⚙️  Admin: ${process.env.ADMIN_URL}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use. Trying port ${Number(PORT) + 1}...\n`);
    server.listen(Number(PORT) + 1, () => {
      console.log(`\n🚀 Sholok Blog Server running on port ${Number(PORT) + 1}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
      console.log(`⚙️  Admin: ${process.env.ADMIN_URL}\n`);
    });
  } else {
    throw err;
  }
});

// Graceful shutdown — lets nodemon properly free the port before restart
const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing server...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  // Force exit after 5s if server doesn't close cleanly
  setTimeout(() => process.exit(1), 5000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
