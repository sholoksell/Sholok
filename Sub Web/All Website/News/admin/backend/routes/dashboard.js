const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status='published') as published,
        SUM(status='draft') as draft,
        SUM(status='scheduled') as scheduled,
        SUM(status='pending') as pending,
        SUM(is_featured=1 AND status='published') as featured,
        SUM(is_breaking=1 AND status='published') as breaking
      FROM news_articles`);

    const [[{ total_cats }]] = await pool.query("SELECT COUNT(*) as total_cats FROM news_categories WHERE is_active=1");
    const [[{ total_authors }]] = await pool.query("SELECT COUNT(*) as total_authors FROM news_authors WHERE is_active=1");
    const [[{ total_views }]] = await pool.query("SELECT COALESCE(SUM(view_count),0) as total_views FROM news_articles WHERE status='published'");

    const [[{ today_published }]] = await pool.query(`
      SELECT COUNT(*) as today_published FROM news_articles
      WHERE status='published' AND DATE(publish_at)=CURDATE()`);

    const [most_viewed] = await pool.query(`
      SELECT a.id, a.title_en, a.title_bn, a.slug, a.view_count, c.name_en as category
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      WHERE a.status='published'
      ORDER BY a.view_count DESC LIMIT 5`);

    const [recent] = await pool.query(`
      SELECT a.id, a.title_en, a.title_bn, a.status, a.created_at,
             u.name as created_by
      FROM news_articles a
      LEFT JOIN news_admin_users u ON a.created_by=u.id
      ORDER BY a.created_at DESC LIMIT 10`);

    const [daily_stats] = await pool.query(`
      SELECT DATE(publish_at) as date, COUNT(*) as count
      FROM news_articles
      WHERE status='published' AND publish_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(publish_at) ORDER BY date ASC`);

    const [category_stats] = await pool.query(`
      SELECT c.name_en as category, COUNT(a.id) as count
      FROM news_categories c
      LEFT JOIN news_articles a ON a.category_id=c.id AND a.status='published'
      GROUP BY c.id ORDER BY count DESC`);

    res.json({
      stats: {
        ...totals,
        total_categories: total_cats,
        total_authors,
        total_views,
        today_published,
      },
      most_viewed,
      recent_articles: recent,
      daily_stats,
      category_stats,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
