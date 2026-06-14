const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Get all reviews (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, productId, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (productId) query.productId = productId;

    const reviews = await Review.find(query)
      .populate('productId', 'name thumbnail')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const filtered = reviews.filter(r =>
        (r.customerId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.productId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.comment || '').toLowerCase().includes(search.toLowerCase())
      );
      return res.json(filtered);
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: 'approved',
    })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get review stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'approved' }),
      Review.countDocuments({ status: 'rejected' }),
    ]);
    const avgRating = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    res.json({
      total,
      pending,
      approved,
      rejected,
      averageRating: avgRating[0]?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create review (customer-side)
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update review status (approve/reject)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('productId', 'name thumbnail')
     .populate('customerId', 'name email');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update status
router.post('/bulk-status', authMiddleware, async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Review.updateMany({ _id: { $in: ids } }, { status });
    res.json({ message: `${ids.length} reviews updated` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    await Review.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} reviews deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
