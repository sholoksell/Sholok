'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'ecommerce_admin', 'server', 'uploads')));

const authRoutes         = require('./routes/auth');
const customerAuthRoutes = require('./routes/customerAuth');
const categoryRoutes     = require('./routes/categories');
const productRoutes      = require('./routes/products');
const cartRoutes         = require('./routes/cart');
const orderRoutes        = require('./routes/orders');
const addressRoutes      = require('./routes/addresses');
const couponRoutes       = require('./routes/coupons');
const bannerRoutes       = require('./routes/banners');
const deliveryRoutes     = require('./routes/delivery');
const searchRoutes       = require('./routes/search');
const dictionaryRoutes   = require('./routes/dictionary');
const cafeRoutes         = require('./routes/cafes');
const locationRoutes     = require('./routes/locations');
const financeRoutes      = require('./routes/finance');
const reviewRoutes       = require('./routes/reviews');
const wishlistRoutes     = require('./routes/wishlist');
const rewardsRoutes      = require('./routes/rewards');

app.use('/api/auth',          authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/categories',        categoryRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/addresses',     addressRoutes);
app.use('/api/coupons',       couponRoutes);
app.use('/api/banners',       bannerRoutes);
app.use('/api/delivery',      deliveryRoutes);
app.use('/api/search',        searchRoutes);
app.use('/api/dictionary',    dictionaryRoutes);
app.use('/api/cafes',         cafeRoutes);
app.use('/api/locations',     locationRoutes);
app.use('/api/finance',       financeRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/rewards',       rewardsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sholok Customer Server is running', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
