const express  = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// GET /api/search?q=&type=posts|users&category=&tag=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { q, type = 'posts', category, tag, sort = 'relevance', page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }
    const term = q.trim();
    const like = `%${term}%`;

    if (type === 'users') {
      const [users] = await pool.execute(
        `SELECT u.id, u.username, u.display_name, u.bio, u.avatar,
                COUNT(uf.follower_id) AS follower_count
         FROM users u LEFT JOIN user_follows uf ON uf.followed_id = u.id
         WHERE u.is_active = 1 AND (u.username LIKE ? OR u.display_name LIKE ? OR u.bio LIKE ?)
         GROUP BY u.id LIMIT ? OFFSET ?`,
        [like, like, like, parseInt(limit), skip]
      );
      const [[{ total }]] = await pool.execute(
        'SELECT COUNT(*) AS total FROM users WHERE is_active = 1 AND (username LIKE ? OR display_name LIKE ? OR bio LIKE ?)',
        [like, like, like]
      );
      return res.json({
        success: true,
        users: users.map((u) => ({
          _id:          String(u.id),
          username:     u.username,
          displayName:  u.display_name,
          bio:          u.bio     || '',
          avatar:       u.avatar  || '',
          followerCount: u.follower_count,
        })),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      });
    }

    // Posts search
    const where  = ["p.status = 'published'", 'p.is_deleted = 0',
      '(p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ? OR EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag LIKE ?))'];
    const params = [like, like, like, like];

    if (category) { where.push('p.category_id = ?'); params.push(parseInt(category)); }
    if (tag)      { where.push('EXISTS (SELECT 1 FROM post_tags pt2 WHERE pt2.post_id = p.id AND pt2.tag = ?)'); params.push(tag.toLowerCase()); }

    const orderMap = { latest: 'p.created_at DESC', popular: 'p.views DESC', relevance: 'p.views DESC, p.created_at DESC' };
    const order    = orderMap[sort] || 'p.views DESC, p.created_at DESC';

    const [posts] = await pool.execute(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, p.status, p.views,
              p.is_featured, p.read_time, p.published_at, p.created_at,
              u.id AS author_id, u.username AS author_username, u.display_name AS author_display_name, u.avatar AS author_avatar,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.color AS category_color,
              GROUP_CONCAT(DISTINCT pt.tag SEPARATOR ',') AS tags_str
       FROM posts p
       JOIN users u ON u.id = p.author_id
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN post_tags pt ON pt.post_id = p.id
       WHERE ${where.join(' AND ')}
       GROUP BY p.id ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), skip]
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(DISTINCT p.id) AS total FROM posts p WHERE ${where.join(' AND ')}`,
      params
    );

    // Tag suggestions
    const [tagRows] = await pool.execute(
      `SELECT DISTINCT tag FROM post_tags pt
       JOIN posts p ON p.id = pt.post_id
       WHERE pt.tag LIKE ? AND p.status = 'published'
       LIMIT 10`,
      [like]
    );
    const suggestions = tagRows.map((t) => t.tag);

    res.json({
      success: true,
      posts: posts.map((p) => ({
        _id:           String(p.id),
        title:         p.title,
        slug:          p.slug,
        excerpt:       p.excerpt        || '',
        featuredImage: p.featured_image || '',
        views:         p.views,
        isFeatured:    Boolean(p.is_featured),
        readTime:      p.read_time,
        publishedAt:   p.published_at,
        createdAt:     p.created_at,
        tags:          p.tags_str ? p.tags_str.split(',') : [],
        author:   { _id: String(p.author_id), username: p.author_username, displayName: p.author_display_name, avatar: p.author_avatar || '' },
        category: { _id: String(p.category_id), name: p.category_name, slug: p.category_slug, color: p.category_color || '' },
      })),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/search/suggestions?q=
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json({ success: true, suggestions: { tags: [], posts: [] } });

    const like = `%${q}%`;

    const [tagRows] = await pool.execute(
      `SELECT DISTINCT pt.tag FROM post_tags pt
       JOIN posts p ON p.id = pt.post_id AND p.status = 'published'
       WHERE pt.tag LIKE ? LIMIT 5`,
      [like]
    );
    const [postRows] = await pool.execute(
      `SELECT id, title, slug FROM posts WHERE title LIKE ? AND status = 'published' AND is_deleted = 0 LIMIT 5`,
      [like]
    );

    res.json({
      success: true,
      suggestions: {
        tags:  tagRows.map((t) => t.tag),
        posts: postRows.map((p) => ({ _id: String(p.id), title: p.title, slug: p.slug })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
