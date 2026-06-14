const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

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

// Get wishlist
router.get('/', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id)
      .populate('wishlist', 'name slug thumbnail regularPrice salePrice stock images');
    res.json(customer?.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/add', customerAuthMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (customer.wishlist.includes(productId)) {
      return res.json({ message: 'Already in wishlist', wishlist: customer.wishlist });
    }

    customer.wishlist.push(productId);
    await customer.save();
    res.json({ message: 'Added to wishlist', wishlist: customer.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.post('/remove', customerAuthMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
    await customer.save();
    res.json({ message: 'Removed from wishlist', wishlist: customer.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    const isInWishlist = customer?.wishlist?.includes(req.params.productId) || false;
    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
