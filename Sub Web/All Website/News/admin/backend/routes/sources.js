const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const [sources] = await db.query('SELECT * FROM news_sources WHERE is_active = 1 ORDER BY name LIMIT 100');
    res.json({ sources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
