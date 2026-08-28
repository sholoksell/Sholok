const express  = require('express');
const { pool } = require('../config/db');
const { protect, optionalAuth } = require('../middleware/auth');
const upload   = require('../middleware/upload');

const router = express.Router();

const buildUser = (u) => ({
  _id:         String(u.id),
  username:    u.username,
  email:       u.email       || undefined,
  displayName: u.display_name,
  bio:         u.bio          || '',
  avatar:      u.avatar       || '',
  coverImage:  u.cover_image  || '',
  role:        u.role,
  isVerified:  Boolean(u.is_verified),
  isActive:    Boolean(u.is_active),
  website:     u.website      || '',
  location:    u.location     || '',
  totalViews:  u.total_views  || 0,
  lastLogin:   u.last_login   || null,
  createdAt:   u.created_at,
  updatedAt:   u.updated_at,
});

// GET /api/users - Popular/top bloggers sorted by follower count
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'followers' } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const order = sort === 'new' ? 'u.created_at DESC' : 'follower_count DESC';

    const [users] = await pool.execute(
      `SELECT u.id, u.username, u.display_name, u.bio, u.avatar, u.cover_image,
              u.role, u.is_verified, u.is_active, u.website, u.location,
              u.total_views, u.last_login, u.created_at, u.updated_at,
              COUNT(uf.follower_id) AS follower_count
       FROM users u
       LEFT JOIN user_follows uf ON uf.followed_id = u.id
       WHERE u.is_active = 1 AND u.role = 'user'
       GROUP BY u.id
       ORDER BY ${order}
       LIMIT ? OFFSET ?`,
      [parseInt(limit), skip]
    );

    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users WHERE is_active = 1 AND role = 'user'"
    );

    res.json({
      success: true,
      users: users.map((u) => ({ ...buildUser(u), followerCount: u.follower_count })),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:username - Profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.display_name, u.bio, u.avatar, u.cover_image,
              u.role, u.is_verified, u.is_active, u.website, u.location,
              u.total_views, u.last_login, u.created_at, u.updated_at
       FROM users u WHERE u.username = ? AND u.is_active = 1 LIMIT 1`,
      [req.params.username]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const u      = rows[0];
    const userId = u.id;

    const [followers] = await pool.execute(
      `SELECT uf.follower_id AS id, us.username, us.display_name AS displayName, us.avatar
       FROM user_follows uf JOIN users us ON us.id = uf.follower_id WHERE uf.followed_id = ?`,
      [userId]
    );
    const [following] = await pool.execute(
      `SELECT uf.followed_id AS id, us.username, us.display_name AS displayName, us.avatar
       FROM user_follows uf JOIN users us ON us.id = uf.followed_id WHERE uf.follower_id = ?`,
      [userId]
    );
    const [neighborReqs] = await pool.execute(
      'SELECT requester_id FROM user_neighbor_requests WHERE target_id = ?',
      [userId]
    );

    // Published posts
    const [posts] = await pool.execute(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, p.status, p.views,
              p.is_featured, p.published_at, p.created_at,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.color AS category_color,
              GROUP_CONCAT(DISTINCT pt.tag SEPARATOR ',') AS tags_str
       FROM posts p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN post_tags pt ON pt.post_id = p.id
       WHERE p.author_id = ? AND p.status = 'published' AND p.is_deleted = 0
       GROUP BY p.id ORDER BY p.published_at DESC LIMIT 10`,
      [userId]
    );
    const [[{ totalPosts }]] = await pool.execute(
      "SELECT COUNT(*) AS totalPosts FROM posts WHERE author_id = ? AND status = 'published' AND is_deleted = 0",
      [userId]
    );

    const mapFollowUser = (r) => ({ _id: String(r.id), username: r.username, displayName: r.displayName, avatar: r.avatar || '' });

    const isFollowing = req.user
      ? followers.some((f) => String(f.id) === String(req.user.id))
      : false;
    const hasPendingRequest = req.user
      ? neighborReqs.some((r) => String(r.requester_id) === String(req.user.id))
      : false;

    const mapPost = (p) => ({
      _id:           String(p.id),
      title:         p.title,
      slug:          p.slug,
      excerpt:       p.excerpt        || '',
      featuredImage: p.featured_image || '',
      status:        p.status,
      views:         p.views,
      isFeatured:    Boolean(p.is_featured),
      publishedAt:   p.published_at,
      createdAt:     p.created_at,
      tags:          p.tags_str ? p.tags_str.split(',') : [],
      category: { _id: String(p.category_id), name: p.category_name, slug: p.category_slug, color: p.category_color },
    });

    res.json({
      success: true,
      user: {
        ...buildUser(u),
        followers:        followers.map(mapFollowUser),
        following:        following.map(mapFollowUser),
        neighborRequests: neighborReqs.map((r) => String(r.requester_id)),
      },
      posts:      posts.map(mapPost),
      totalPosts,
      isFollowing,
      hasPendingRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/profile
router.put(
  '/profile',
  protect,
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { displayName, bio, website, location, interests } = req.body;
      const updates = [];
      const vals    = [];

      if (displayName !== undefined) { updates.push('display_name = ?'); vals.push(displayName); }
      if (bio         !== undefined) { updates.push('bio = ?');          vals.push(bio);         }
      if (website     !== undefined) { updates.push('website = ?');      vals.push(website);     }
      if (location    !== undefined) { updates.push('location = ?');     vals.push(location);    }
      if (req.files?.avatar)       { updates.push('avatar = ?');      vals.push(`/uploads/avatars/${req.files.avatar[0].filename}`);     }
      if (req.files?.coverImage)   { updates.push('cover_image = ?'); vals.push(`/uploads/avatars/${req.files.coverImage[0].filename}`); }

      if (updates.length) {
        await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [...vals, req.user.id]);
      }

      // Update interests
      if (interests !== undefined) {
        const parsed = JSON.parse(interests);
        await pool.execute('DELETE FROM user_interests WHERE user_id = ?', [req.user.id]);
        if (parsed.length) {
          const intValues = parsed.map((i) => [req.user.id, String(i).trim()]);
          await pool.query('INSERT IGNORE INTO user_interests (user_id, interest) VALUES ?', [intValues]);
        }
      }

      const [rows] = await pool.execute(
        `SELECT id, username, email, display_name, bio, avatar, cover_image, role, is_verified,
                is_active, website, location, total_views, last_login, created_at, updated_at
         FROM users WHERE id = ? LIMIT 1`,
        [req.user.id]
      );
      const [ints] = await pool.execute(
        'SELECT interest FROM user_interests WHERE user_id = ?',
        [req.user.id]
      );

      res.json({
        success: true,
        message: 'Profile updated',
        user: { ...buildUser(rows[0]), interests: ints.map((i) => i.interest) },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/users/:id/follow (toggle)
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [targetRows] = await pool.execute(
      'SELECT id, is_active FROM users WHERE id = ? LIMIT 1',
      [targetId]
    );
    if (!targetRows.length || !targetRows[0].is_active) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [existing] = await pool.execute(
      'SELECT 1 FROM user_follows WHERE follower_id = ? AND followed_id = ? LIMIT 1',
      [req.user.id, targetId]
    );

    if (existing.length) {
      await pool.execute(
        'DELETE FROM user_follows WHERE follower_id = ? AND followed_id = ?',
        [req.user.id, targetId]
      );
      return res.json({ success: true, following: false, message: 'Unfollowed successfully' });
    }

    await pool.execute(
      'INSERT IGNORE INTO user_follows (follower_id, followed_id) VALUES (?, ?)',
      [req.user.id, targetId]
    );

    // Notify
    try {
      const [notifResult] = await pool.execute(
        `INSERT INTO notifications (recipient_id, sender_id, type, message, link)
         VALUES (?, ?, 'new_follower', ?, ?)`,
        [targetId, req.user.id, `${req.user.displayName} started following you`, `/profile/${req.user.username}`]
      );
      const io = req.app.get('io');
      io.to(String(targetId)).emit('notification', { _id: String(notifResult.insertId), type: 'new_follower' });
    } catch (_) {}

    return res.json({ success: true, following: true, message: 'Following successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id/followers
router.get('/:id/followers', async (req, res) => {
  try {
    const [followers] = await pool.execute(
      `SELECT u.id, u.username, u.display_name AS displayName, u.avatar, u.bio
       FROM user_follows uf JOIN users u ON u.id = uf.follower_id
       WHERE uf.followed_id = ?`,
      [req.params.id]
    );
    res.json({
      success: true,
      followers: followers.map((u) => ({ _id: String(u.id), username: u.username, displayName: u.displayName, avatar: u.avatar || '', bio: u.bio || '' })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id/following
router.get('/:id/following', async (req, res) => {
  try {
    const [following] = await pool.execute(
      `SELECT u.id, u.username, u.display_name AS displayName, u.avatar, u.bio
       FROM user_follows uf JOIN users u ON u.id = uf.followed_id
       WHERE uf.follower_id = ?`,
      [req.params.id]
    );
    res.json({
      success: true,
      following: following.map((u) => ({ _id: String(u.id), username: u.username, displayName: u.displayName, avatar: u.avatar || '', bio: u.bio || '' })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/:id/save-post (toggle)
router.post('/:id/save-post', protect, async (req, res) => {
  try {
    const { postId } = req.body;
    const [existing] = await pool.execute(
      'SELECT 1 FROM user_saved_posts WHERE user_id = ? AND post_id = ? LIMIT 1',
      [req.user.id, parseInt(postId)]
    );

    if (existing.length) {
      await pool.execute('DELETE FROM user_saved_posts WHERE user_id = ? AND post_id = ?', [req.user.id, parseInt(postId)]);
      return res.json({ success: true, saved: false });
    }

    await pool.execute(
      'INSERT INTO user_saved_posts (user_id, post_id) VALUES (?, ?)',
      [req.user.id, parseInt(postId)]
    );
    res.json({ success: true, saved: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
