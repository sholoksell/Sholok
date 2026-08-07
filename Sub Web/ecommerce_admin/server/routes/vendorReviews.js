const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/vendor-reviews?status=...
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (status && status !== 'all') {
      where += ' AND vr.status = ?';
      params.push(status);
    }

    const [reviews] = await pool.query(
      `SELECT vr.*, v.store_name, v.slug as vendor_slug,
              c.name as customer_name, c.email as customer_email
       FROM vendor_reviews vr
       LEFT JOIN vendors v ON vr.vendor_id = v.id
       LEFT JOIN customers c ON vr.customer_id = c.id
       WHERE ${where}
       ORDER BY vr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM vendor_reviews vr WHERE ${where}`,
      params
    );

    res.json({ reviews, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/vendor-reviews/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','approved','rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    await pool.query('UPDATE vendor_reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/vendor-reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vendor_reviews WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
