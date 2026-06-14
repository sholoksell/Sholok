const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const PasswordReset = require('../models/PasswordReset');

const customerAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sholok_customer_secret_key_2024');
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = new Customer({
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      status: 'active',
    });

    await customer.save();

    const token = jwt.sign(
      { id: customer._id, email: customer.email, type: 'customer' },
      process.env.JWT_SECRET || 'sholok_customer_secret_key_2024',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (customer.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    if (!customer.password) {
      return res.status(400).json({ message: 'No password set. Please register again.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email, type: 'customer' },
      process.env.JWT_SECRET || 'sholok_customer_secret_key_2024',
      { expiresIn: '30d' }
    );

    // Track login activity
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    const device = req.headers['user-agent'] || '';
    customer.lastLogin = new Date();
    customer.lastLoginIp = ip;
    if (!customer.loginHistory) customer.loginHistory = [];
    customer.loginHistory.push({ ip, device, date: new Date() });
    if (customer.loginHistory.length > 20) customer.loginHistory = customer.loginHistory.slice(-20);
    await customer.save();

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current customer profile
router.get('/me', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', customerAuthMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', customerAuthMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const customer = await Customer.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── FORGOT PASSWORD ROUTES ──────────────────────────────────────────────────

// POST /customer-auth/forgot-password — send OTP to email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Remove any existing OTPs for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    // Store OTP with 10 minute expiry
    await PasswordReset.create({
      email: email.toLowerCase(),
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Log OTP to console (replace with email service in production)
    console.log(`\x1b[36m📧 Password Reset OTP for ${email}: ${otp}\x1b[0m`);

    res.json({
      message: 'Verification code sent to your email',
      // Include OTP in dev mode so the frontend can show it for testing
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /customer-auth/verify-otp — verify the OTP code
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const record = await PasswordReset.findOne({
      email: email.toLowerCase(),
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Mark as verified
    record.verified = true;
    await record.save();

    res.json({ message: 'Verification successful', verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /customer-auth/reset-password — set new password after OTP verification
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify the OTP was previously verified
    const record = await PasswordReset.findOne({
      email: email.toLowerCase(),
      otp,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset session. Please start over.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    // Clean up used OTP
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ORDER ROUTES (customer-facing) ──────────────────────────────────────────

const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /customer-auth/orders — get the logged-in customer's orders
router.get('/orders', customerAuthMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customer.id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name images thumbnail');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /customer-auth/orders/:id — get a single order by ID
router.get('/orders/:id', customerAuthMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.customer.id })
      .populate('items.productId', 'name images thumbnail price');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /customer-auth/orders — place a new order & reduce stock
router.post('/orders', customerAuthMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingCost, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Generate unique order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;

    // Map frontend payment methods to schema enum
    const paymentMap = { cod: 'cash_on_delivery', online: 'credit_card' };
    const mappedPayment = paymentMap[paymentMethod] || 'cash_on_delivery';

    // Reduce stock for each ordered product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = new Order({
      orderNumber,
      customerId: req.customer.id,
      items,
      subtotal,
      shipping: shippingCost || 0,
      total,
      paymentMethod: mappedPayment,
      shippingAddress,
    });

    const savedOrder = await order.save();

    // Update customer lifetime stats
    await Customer.findByIdAndUpdate(req.customer.id, {
      $inc: { totalOrders: 1, totalSpent: total },
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /customer-auth/orders/:id/cancel — cancel order & restore stock
router.put('/orders/:id/cancel', customerAuthMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.customer.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order cannot be cancelled' });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
