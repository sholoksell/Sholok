const express  = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/my-stats
router.get('/my-stats', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    // Author's posts
    const [myPosts] = await pool.execute(
      `SELECT p.id, p.title, p.slug, p.views, p.unique_views,
              COUNT(DISTINCT pl.user_id) AS likes_count
       FROM posts p
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       WHERE p.author_id = ? AND p.is_deleted = 0
       GROUP BY p.id`,
      [req.user.id]
    );

    if (!myPosts.length) {
      return res.json({
        success: true,
        totals: { views: 0, uniqueViews: 0, reactions: 0, comments: 0 },
        myPosts: [],
        dailyData: [],
        analytics: [],
      });
    }

    const postIds = myPosts.map((p) => p.id);

    const [analytics] = await pool.query(
      `SELECT a.id, a.post_id, a.date, a.views, a.unique_views, a.reactions, a.comments,
              p.title AS post_title, p.slug AS post_slug
       FROM analytics a JOIN posts p ON p.id = a.post_id
       WHERE a.post_id IN (?) AND a.date >= ?
       ORDER BY a.date DESC`,
      [postIds, since]
    );

    const totals = analytics.reduce(
      (acc, a) => ({
        views:       acc.views       + a.views,
        uniqueViews: acc.uniqueViews + a.unique_views,
        reactions:   acc.reactions   + a.reactions,
        comments:    acc.comments    + a.comments,
      }),
      { views: 0, uniqueViews: 0, reactions: 0, comments: 0 }
    );

    const dailyMap = {};
    analytics.forEach((a) => {
      const dateKey = typeof a.date === 'string' ? a.date.slice(0, 10) : new Date(a.date).toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, views: 0, reactions: 0, comments: 0 };
      dailyMap[dateKey].views     += a.views;
      dailyMap[dateKey].reactions += a.reactions;
      dailyMap[dateKey].comments  += a.comments;
    });

    res.json({
      success: true,
      totals,
      myPosts: myPosts.map((p) => ({
        _id:         String(p.id),
        title:       p.title,
        slug:        p.slug,
        views:       p.views,
        uniqueViews: p.unique_views,
        likes:       p.likes_count,
      })),
      dailyData: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
      analytics: analytics.map((a) => ({
        _id:        String(a.id),
        post:       { _id: String(a.post_id), title: a.post_title, slug: a.post_slug },
        date:       a.date,
        views:      a.views,
        uniqueViews:a.unique_views,
        reactions:  a.reactions,
        comments:   a.comments,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/post/:postId
router.get('/post/:postId', protect, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const [postRows] = await pool.execute(
      'SELECT id, author_id, title, views, unique_views FROM posts WHERE id = ? LIMIT 1',
      [postId]
    );
    if (!postRows.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const post = postRows[0];
    if (String(post.author_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    const [analytics] = await pool.execute(
      'SELECT * FROM analytics WHERE post_id = ? AND date >= ? ORDER BY date ASC',
      [postId, since]
    );

    res.json({
      success: true,
      analytics: analytics.map((a) => ({
        _id:        String(a.id),
        date:       a.date,
        views:      a.views,
        uniqueViews:a.unique_views,
        reactions:  a.reactions,
        comments:   a.comments,
      })),
      post: {
        _id:        String(post.id),
        title:      post.title,
        views:      post.views,
        uniqueViews:post.unique_views,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
