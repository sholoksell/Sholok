const express = require('express');
const Analytics = require('../models/Analytics');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/my-stats (author's own analytics)
router.get('/my-stats', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const myPosts = await Post.find({ author: req.user._id, isDeleted: false }).select('_id title slug views uniqueViews likes').lean();
    const postIds = myPosts.map((p) => p._id);

    const analytics = await Analytics.find({ post: { $in: postIds }, date: { $gte: since } })
      .populate('post', 'title slug')
      .sort({ date: -1 })
      .lean();

    // Aggregate totals
    const totals = analytics.reduce(
      (acc, a) => ({
        views: acc.views + a.views,
        uniqueViews: acc.uniqueViews + a.uniqueViews,
        reactions: acc.reactions + a.reactions,
        comments: acc.comments + a.comments,
      }),
      { views: 0, uniqueViews: 0, reactions: 0, comments: 0 }
    );

    // Daily chart data
    const dailyData = {};
    analytics.forEach((a) => {
      const dateKey = a.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) dailyData[dateKey] = { date: dateKey, views: 0, reactions: 0, comments: 0 };
      dailyData[dateKey].views += a.views;
      dailyData[dateKey].reactions += a.reactions;
      dailyData[dateKey].comments += a.comments;
    });

    res.json({
      success: true,
      totals,
      myPosts,
      dailyData: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
      analytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/post/:postId
router.get('/post/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const analytics = await Analytics.find({ post: req.params.postId, date: { $gte: since } }).sort({ date: 1 }).lean();

    res.json({ success: true, analytics, post: { title: post.title, views: post.views, uniqueViews: post.uniqueViews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
