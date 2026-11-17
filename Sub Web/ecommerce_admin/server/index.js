const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fallback: generate SVG placeholder for missing uploads
app.get('/uploads/:filename(*)', (req, res) => {
  const filename = req.params.filename || '';
  const name = decodeURIComponent(filename).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  const letter = name.charAt(0).toUpperCase() || '?';
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  const color = colors[letter.charCodeAt(0) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}" rx="8"/>
  <text x="100" y="130" font-size="90" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">${letter}</text>
</svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// Initialise MySQL connection pool (logs success/error on startup)
require('./db');

// Auto-migrate bilingual product columns
setTimeout(() => require('./migrate-bilingual')(), 2000);

// Import Routes
const authRoutes = require('./routes/auth');
const customerAuthRoutes = require('./routes/customerAuth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const shippingRoutes = require('./routes/shipping');
const deliveryRatesRoutes = require('./routes/deliveryRates');
const reportsRoutes = require('./routes/reports');
const bannerRoutes = require('./routes/banners');
const marketingRoutes = require('./routes/marketing');
const reviewRoutes = require('./routes/reviews');
const homeSectionRoutes = require('./routes/homeSections');
const vendorRoutes = require('./routes/vendors');
const warehouseRoutes = require('./routes/warehouses');
const courierRoutes = require('./routes/couriers');
const deliveryCoverageRoutes = require('./routes/deliveryCoverage');
const grocerySettingsRoutes = require('./routes/grocerySettings');
const shipmentsRoutes = require('./routes/shipments');
const codSettlementRoutes = require('./routes/codSettlement');
const brandRoutes = require('./routes/brands');
const returnsRoutes = require('./routes/returns');
const vendorAuthRoutes = require('./routes/vendorAuth');
const vendorPanelRoutes = require('./routes/vendorPanel');
const storesRoutes = require('./routes/stores');
const wishlistRoutes = require('./routes/wishlist');
const customerLocationRoutes = require('./routes/customerLocation');
const vendorReviewsRouter = require('./routes/vendorReviews');
const searchRouter = require('./routes/search');
const recommendationsRouter = require('./routes/recommendations');
const priceComparisonRouter = require('./routes/priceComparison');
const liveShopRouter = require('./routes/liveShop');
const questionsRouter = require('./routes/questions');
const bundleOffersRouter = require('./routes/bundleOffers');
const campaignsRouter = require('./routes/campaigns');
const megamenuFeaturesRouter = require('./routes/megamenuFeatures');
const invoiceRouter = require('./routes/invoice');
const checkoutSettingsRouter = require('./routes/checkoutSettings');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/delivery-rates', deliveryRatesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/home-sections', homeSectionRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/delivery-coverage', deliveryCoverageRoutes);
app.use('/api/grocery-settings', grocerySettingsRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/cod-settlement', codSettlementRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/vendor-auth', vendorAuthRoutes);
app.use('/api/vendor', vendorPanelRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/customer-location', customerLocationRoutes);
app.use('/api/vendor-reviews', vendorReviewsRouter);
app.use('/api/search', searchRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/price-comparison', priceComparisonRouter);
app.use('/api/live-shop', liveShopRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/bundle-offers', bundleOffersRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/megamenu-features', megamenuFeaturesRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/checkout-settings', checkoutSettingsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', db: 'MySQL' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
