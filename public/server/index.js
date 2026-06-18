const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from admin server's uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'ecommerce_admin', 'server', 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const customerAuthRoutes = require('./routes/customerAuth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const addressRoutes = require('./routes/addresses');
const couponRoutes = require('./routes/coupons');
const bannerRoutes = require('./routes/banners');
const deliveryRoutes = require('./routes/delivery');
const searchRoutes = require('./routes/search');
const dictionaryRoutes = require('./routes/dictionary');
const cafeRoutes = require('./routes/cafes');
const locationRoutes = require('./routes/locations');
const financeRoutes = require('./routes/finance');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const rewardsRoutes = require('./routes/rewards');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes); // Add direct route for cache clearing
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/rewards', rewardsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Sholok Customer Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
const serverInstance = app.listen(PORT, () => {
  console.log(`🚀 Customer Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

serverInstance.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use. Kill the existing process or set a different PORT env variable.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
