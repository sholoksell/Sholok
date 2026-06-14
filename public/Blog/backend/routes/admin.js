const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const Analytics = require('../models/Analytics');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/dashboard - Overview stats
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, totalCategories] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Category.countDocuments({ isActive: true }),
    ]);

    const [publishedPosts, draftPosts, recentUsers, recentPosts] = await Promise.all([
      Post.countDocuments({ status: 'published', isDeleted: false }),
      Post.countDocuments({ status: 'draft', isDeleted: false }),
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('username displayName avatar createdAt').lean(),
      Post.find({ isDeleted: false }).populate('author', 'username displayName').populate('category', 'name').sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    // Total views
    const viewsAgg = await Post.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Daily views for last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyViews = await Analytics.aggregate([
      { $match: { date: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, views: { $sum: '$views' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalPosts, publishedPosts, draftPosts, totalComments, totalCategories, totalViews },
      recentUsers,
      recentPosts,
      dailyViews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (search) filter.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { displayName: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/posts
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [posts, total] = await Promise.all([
      Post.find(filter).populate('author', 'username displayName').populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Post.countDocuments(filter),
    ]);
    res.json({ success: true, posts, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/posts/:id
router.put('/posts/:id', async (req, res) => {
  try {
    const { status, isFeatured } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/posts/:id (hard delete)
router.delete('/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { isDeleted: true, status: 'deleted' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/comments
router.get('/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20, isSpam } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isDeleted: false };
    if (isSpam === 'true') filter.isSpam = true;

    const [comments, total] = await Promise.all([
      Comment.find(filter).populate('author', 'username displayName').populate('post', 'title slug').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Comment.countDocuments(filter),
    ]);
    res.json({ success: true, comments, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/comments/:id/spam
router.put('/comments/:id/spam', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isSpam: true, isDeleted: true }, { new: true });
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/seed-categories
router.post('/seed-categories', async (req, res) => {
  try {
    const count = await Category.countDocuments();
    if (count > 0) return res.json({ success: true, message: 'Categories already seeded' });
    // Categories will be auto-seeded on first GET /api/categories request
    res.json({ success: true, message: 'Visit GET /api/categories to auto-seed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
