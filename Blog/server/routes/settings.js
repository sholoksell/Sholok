const express  = require('express');
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings  (public — homepage needs counts and visibility flags)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM blog_settings');
    const settings = {};
    rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings  (admin only)
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings object' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(settings)) {
        await conn.execute(
          'INSERT INTO blog_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=?',
          [key, String(value), String(value)]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
