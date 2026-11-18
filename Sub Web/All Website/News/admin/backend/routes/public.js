// Public API — no auth required, returns only published articles
const router = require('express').Router();
const pool = require('../db');

const BASE_FIELDS = `
  a.id, a.title_en, a.title_bn, a.slug, a.summary_en, a.summary_bn,
  a.featured_image, a.view_count, a.publish_at, a.created_at, a.is_featured, a.is_breaking,
  c.name_en as category_name, c.slug as category_slug,
  au.name as author_name`;

// GET /public/news?category=&page=1&limit=10
router.get('/news', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ["a.status='published'", "a.publish_at <= NOW()"], params = [];
    if (category) { where.push('c.slug=?'); params.push(category); }
    const whereStr = 'WHERE ' + where.join(' AND ');
    const [rows] = await pool.query(`
      SELECT ${BASE_FIELDS}
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      ${whereStr}
      ORDER BY a.publish_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM news_articles a LEFT JOIN news_categories c ON a.category_id=c.id ${whereStr}`, params);
    res.json({ articles: rows, total, page: parseInt(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/featured
router.get('/featured', async (req, res) => {
  try {
    const [[row]] = await pool.query(`
      SELECT ${BASE_FIELDS}
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      WHERE a.status='published' AND a.is_featured=1 AND a.publish_at<=NOW()
      ORDER BY a.publish_at DESC LIMIT 1`);
    res.json(row || null);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/breaking
router.get('/breaking', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.title_en, a.title_bn, a.slug
      FROM news_articles a
      WHERE a.status='published' AND a.is_breaking=1 AND a.publish_at<=NOW()
      ORDER BY a.publish_at DESC LIMIT 10`);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/most-read?limit=5
router.get('/most-read', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const [rows] = await pool.query(`
      SELECT ${BASE_FIELDS}
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      WHERE a.status='published' AND a.publish_at<=NOW()
      ORDER BY a.view_count DESC LIMIT ?`, [limit]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/latest?limit=10
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await pool.query(`
      SELECT ${BASE_FIELDS}
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      WHERE a.status='published' AND a.publish_at<=NOW()
      ORDER BY a.publish_at DESC LIMIT ?`, [limit]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/article/:slug
router.get('/article/:slug', async (req, res) => {
  try {
    const [[article]] = await pool.query(`
      SELECT a.*, c.name_en as category_name, c.slug as category_slug,
             au.name as author_name, au.bio as author_bio, au.avatar as author_avatar,
             au.designation as author_designation,
             s.name as source_name, s.url as source_home_url
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      LEFT JOIN news_sources s ON a.source_id=s.id
      WHERE a.slug=? AND a.status='published'`, [req.params.slug]);
    if (!article) return res.status(404).json({ message: 'Not found' });
    pool.query('UPDATE news_articles SET view_count=view_count+1 WHERE id=?', [article.id]).catch(() => {});
    const [tags] = await pool.query(`
      SELECT t.name, t.slug, t.id FROM news_tags t
      JOIN news_article_tags at2 ON t.id=at2.tag_id WHERE at2.article_id=?`, [article.id]);
    const [related] = await pool.query(`
      SELECT ${BASE_FIELDS}
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      WHERE a.status='published' AND a.category_id=? AND a.id<>? AND a.publish_at<=NOW()
      ORDER BY a.publish_at DESC LIMIT 4`, [article.category_id, article.id]);
    res.json({ article, tags, related });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name_en, name_bn, slug, color FROM news_categories WHERE is_active=1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /public/search?q=...
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) return res.json({ articles: [], total: 0 });
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like = `%${q}%`;
    const [rows] = await pool.query(`
      SELECT ${BASE_FIELDS}
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      WHERE a.status='published' AND (a.title_en LIKE ? OR a.title_bn LIKE ? OR a.summary_en LIKE ?)
      ORDER BY a.publish_at DESC LIMIT ? OFFSET ?`, [like, like, like, parseInt(limit), offset]);
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM news_articles WHERE status='published' AND (title_en LIKE ? OR title_bn LIKE ?)", [like, like]);
    res.json({ articles: rows, total, page: parseInt(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
