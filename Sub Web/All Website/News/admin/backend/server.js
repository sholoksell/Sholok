require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.NEWS_PORT || 5002;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads', 'news');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://sholok.com', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/news-uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/news', require('./routes/news'));
app.use('/categories', require('./routes/categories'));
app.use('/authors', require('./routes/authors'));
app.use('/media', require('./routes/media'));
app.use('/sources', require('./routes/sources'));
app.use('/public', require('./routes/public'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sholok-news-api', port: PORT }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`Sholok News API running on port ${PORT}`));
