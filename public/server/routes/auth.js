const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const Customer = require('../models/Customer');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingCustomer) {
      return res.status(400).json({ 
        message: 'Customer already exists with this email or phone' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await customer.save();

    // Generate token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'sholok_customer_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is blocked
    if (customer.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    // Generate token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'sholok_customer_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current customer
router.get('/me', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId)
      .select('-password')
      .populate('defaultAddress');

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer data', error: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.customerId,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.customerId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.password = hashedPassword;
    await customer.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

module.exports = router;
