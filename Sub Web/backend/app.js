require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/customer-auth', require('./routes/customerAuth'));
app.use('/api/categories',    require('./routes/categories'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/customers',     require('./routes/customers'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/banners',       require('./routes/banners'));
app.use('/api/home-sections', require('./routes/homeSections'));
app.use('/api/shipping',      require('./routes/shipping'));
app.use('/api/marketing',     require('./routes/marketing'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/upload',        require('./routes/upload'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
