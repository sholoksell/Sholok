const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const DEFAULT_FEATURES = [
  { key: 'flash_sales',  name: 'Flash Sales',     emoji: '⚡', link: '/flash-sales', sort_order: 1 },
  { key: 'discover',     name: 'Discover',         emoji: '✨', link: '/discover',    sort_order: 2 },
  { key: 'offers',       name: 'Offers',           emoji: '🏷️', link: '/offers',      sort_order: 3 },
  { key: 'bundles',      name: 'Bundles',          emoji: '🎁', link: '/bundles',     sort_order: 4 },
  { key: 'summer_fest',  name: 'Summer Fest',      emoji: '☀️', link: '/summer-fest', sort_order: 5 },
  { key: 'great_deals',  name: 'Great Deals',      emoji: '🔥', link: '/deals',       sort_order: 6 },
  { key: 'buy_save',     name: 'Buy & Save More',  emoji: '💰', link: '/buy-save',    sort_order: 7 },
  { key: 'our_brands',   name: 'Our Brands',       emoji: '🏪', link: '/brands',      sort_order: 8 },
];

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS megamenu_features (
        id INT PRIMARY KEY AUTO_INCREMENT,
        feature_key VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        emoji VARCHAR(20) DEFAULT '',
        image VARCHAR(500) DEFAULT '',
        icon_image VARCHAR(500) DEFAULT '',
        description TEXT,
        link VARCHAR(200) DEFAULT '',
        enabled TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    for (const f of DEFAULT_FEATURES) {
      await pool.query(
        `INSERT IGNORE INTO megamenu_features (feature_key, name, emoji, link, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [f.key, f.name, f.emoji, f.link, f.sort_order]
      );
    }
  } catch (err) {
    console.error('megamenu_features table init error:', err.message);
  }
})();

// Public — all enabled features sorted
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM megamenu_features WHERE enabled=1 ORDER BY sort_order ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public — single feature by key
router.get('/by-key/:key', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM megamenu_features WHERE feature_key=?',
      [req.params.key]
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — all features
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM megamenu_features ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — update feature
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, emoji, image, icon_image, description, link, enabled, sort_order } = req.body;
  try {
    await pool.query(
      `UPDATE megamenu_features SET name=?, emoji=?, image=?, icon_image=?, description=?, link=?, enabled=?, sort_order=?
       WHERE id=?`,
      [name, emoji || '', image || '', icon_image || '', description || '', link || '', enabled ? 1 : 0, sort_order || 0, req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM megamenu_features WHERE id=?', [req.params.id]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
