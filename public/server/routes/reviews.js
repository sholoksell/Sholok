const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
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

// Get approved reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: 'approved',
    })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    // Calculate stats
    const total = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => { distribution[r.rating - 1]++; });

    res.json({
      reviews,
      stats: {
        total,
        averageRating: Math.round(avgRating * 10) / 10,
        distribution,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a review (customer only)
router.post('/', customerAuthMiddleware, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product and rating are required' });
    }

    // Check if customer already reviewed this product
    const existing = await Review.findOne({
      productId,
      customerId: req.customer.id,
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      productId,
      customerId: req.customer.id,
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      title: title || '',
      comment: comment || '',
      status: 'pending',
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted! It will appear after approval.', review });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get customer's own reviews
router.get('/my-reviews', customerAuthMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.customer.id })
      .populate('productId', 'name thumbnail slug')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
