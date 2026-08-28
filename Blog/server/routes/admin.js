const express  = require('express');
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalUsers }]]      = await pool.execute("SELECT COUNT(*) AS totalUsers FROM users WHERE is_active = 1");
    const [[{ totalPosts }]]      = await pool.execute("SELECT COUNT(*) AS totalPosts FROM posts WHERE is_deleted = 0");
    const [[{ totalComments }]]   = await pool.execute("SELECT COUNT(*) AS totalComments FROM comments WHERE is_deleted = 0");
    const [[{ totalCategories }]] = await pool.execute("SELECT COUNT(*) AS totalCategories FROM categories WHERE is_active = 1");
    const [[{ publishedPosts }]]  = await pool.execute("SELECT COUNT(*) AS publishedPosts FROM posts WHERE status = 'published' AND is_deleted = 0");
    const [[{ draftPosts }]]      = await pool.execute("SELECT COUNT(*) AS draftPosts FROM posts WHERE status = 'draft' AND is_deleted = 0");
    const [[{ totalViews }]]      = await pool.execute("SELECT IFNULL(SUM(views),0) AS totalViews FROM posts WHERE is_deleted = 0");

    // Daily views for last 7 days
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [dailyViews] = await pool.execute(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS _id, SUM(views) AS views
       FROM analytics WHERE date >= ? GROUP BY DATE_FORMAT(date, '%Y-%m-%d') ORDER BY _id ASC`,
      [since7]
    );

    // Recent users
    const [recentUsers] = await pool.execute(
      `SELECT id, username, display_name, avatar, created_at
       FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5`
    );

    // Recent posts
    const [recentPosts] = await pool.execute(
      `SELECT p.id, p.title, p.slug, p.status, p.created_at,
              u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name,
              c.id AS category_id, c.name AS category_name
       FROM posts p
       JOIN users u ON u.id = p.author_id
       JOIN categories c ON c.id = p.category_id
       WHERE p.is_deleted = 0 ORDER BY p.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: { totalUsers, totalPosts, publishedPosts, draftPosts, totalComments, totalCategories, totalViews },
      recentUsers: recentUsers.map((u) => ({ _id: String(u.id), username: u.username, displayName: u.display_name, avatar: u.avatar || '', createdAt: u.created_at })),
      recentPosts: recentPosts.map((p) => ({
        _id:    String(p.id),
        title:  p.title,
        slug:   p.slug,
        status: p.status,
        createdAt: p.created_at,
        author:   { _id: String(p.author_id), username: p.author_username, displayName: p.author_display_name },
        category: { _id: String(p.category_id), name: p.category_name },
      })),
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
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['1=1'];
    const params = [];

    if (search) {
      where.push('(username LIKE ? OR email LIKE ? OR display_name LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (role) { where.push('role = ?'); params.push(role); }

    const [users] = await pool.execute(
      `SELECT id, username, email, display_name, bio, avatar, role, is_verified, is_active,
              website, location, total_views, last_login, created_at, updated_at
       FROM users WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), skip]
    );
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({
      success: true,
      users: users.map((u) => ({
        _id:         String(u.id),
        username:    u.username,
        email:       u.email,
        displayName: u.display_name,
        bio:         u.bio          || '',
        avatar:      u.avatar       || '',
        role:        u.role,
        isVerified:  Boolean(u.is_verified),
        isActive:    Boolean(u.is_active),
        website:     u.website      || '',
        location:    u.location     || '',
        totalViews:  u.total_views,
        lastLogin:   u.last_login,
        createdAt:   u.created_at,
        updatedAt:   u.updated_at,
      })),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = [];
    const vals    = [];

    if (isActive !== undefined) { updates.push('is_active = ?'); vals.push(isActive ? 1 : 0); }
    if (role)                   { updates.push('role = ?');      vals.push(role);              }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const [result] = await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      [...vals, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const [rows] = await pool.execute(
      'SELECT id, username, email, display_name, role, is_active, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    const u = rows[0];
    res.json({
      success: true,
      user: { _id: String(u.id), username: u.username, email: u.email, displayName: u.display_name, role: u.role, isActive: Boolean(u.is_active), createdAt: u.created_at },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/posts
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['p.is_deleted = 0'];
    const params = [];

    if (status) { where.push('p.status = ?'); params.push(status); }
    if (search) { where.push('p.title LIKE ?'); params.push(`%${search}%`); }

    const [posts] = await pool.execute(
      `SELECT p.id, p.title, p.slug, p.status, p.views, p.is_featured, p.is_deleted,
              p.published_at, p.created_at,
              u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name,
              c.id AS category_id, c.name AS category_name
       FROM posts p
       JOIN users u ON u.id = p.author_id
       JOIN categories c ON c.id = p.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), skip]
    );
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM posts p WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({
      success: true,
      posts: posts.map((p) => ({
        _id:        String(p.id),
        title:      p.title,
        slug:       p.slug,
        status:     p.status,
        views:      p.views,
        isFeatured: Boolean(p.is_featured),
        publishedAt:p.published_at,
        createdAt:  p.created_at,
        author:   { _id: String(p.author_id), username: p.author_username, displayName: p.author_display_name },
        category: { _id: String(p.category_id), name: p.category_name },
      })),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/posts/:id
router.put('/posts/:id', async (req, res) => {
  try {
    const { status, isFeatured } = req.body;
    const updates = [];
    const vals    = [];

    if (status)              { updates.push('status = ?');     vals.push(status);          }
    if (isFeatured !== undefined) { updates.push('is_featured = ?'); vals.push(isFeatured ? 1 : 0); }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const [result] = await pool.execute(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      [...vals, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const [rows] = await pool.execute('SELECT id, title, slug, status, is_featured FROM posts WHERE id = ?', [req.params.id]);
    const p = rows[0];
    res.json({
      success: true,
      post: { _id: String(p.id), title: p.title, slug: p.slug, status: p.status, isFeatured: Boolean(p.is_featured) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/posts/:id (soft delete)
router.delete('/posts/:id', async (req, res) => {
  try {
    await pool.execute(
      "UPDATE posts SET is_deleted = 1, status = 'deleted' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/comments
router.get('/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20, isSpam } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['c.is_deleted = 0'];
    const params = [];

    if (isSpam === 'true') { where.push('c.is_spam = 1'); }

    const [comments] = await pool.execute(
      `SELECT c.id, c.content, c.is_deleted, c.is_spam, c.created_at,
              u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name,
              p.id AS post_id, p.title AS post_title, p.slug AS post_slug
       FROM comments c
       JOIN users u ON u.id = c.author_id
       JOIN posts p ON p.id = c.post_id
       WHERE ${where.join(' AND ')}
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), skip]
    );
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM comments c WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({
      success: true,
      comments: comments.map((c) => ({
        _id:       String(c.id),
        content:   c.content,
        isDeleted: Boolean(c.is_deleted),
        isSpam:    Boolean(c.is_spam),
        createdAt: c.created_at,
        author: { _id: String(c.author_id), username: c.author_username, displayName: c.author_display_name },
        post:   { _id: String(c.post_id),   title: c.post_title, slug: c.post_slug },
      })),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/comments/:id/spam
router.put('/comments/:id/spam', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE comments SET is_spam = 1, is_deleted = 1 WHERE id = ?',
      [req.params.id]
    );
    const [rows] = await pool.execute('SELECT id, is_spam, is_deleted FROM comments WHERE id = ?', [req.params.id]);
    res.json({ success: true, comment: { _id: String(rows[0].id), isSpam: true, isDeleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/seed-categories
router.post('/seed-categories', async (req, res) => {
  try {
    const [[{ cnt }]] = await pool.execute('SELECT COUNT(*) AS cnt FROM categories');
    if (cnt > 0) return res.json({ success: true, message: 'Categories already seeded' });
    res.json({ success: true, message: 'Visit GET /api/categories to auto-seed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
