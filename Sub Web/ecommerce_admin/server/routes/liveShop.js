const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/live-shop/sessions - all live/upcoming sessions (public)
router.get('/sessions', async (req, res) => {
  try {
    const { status = 'live', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let where = status === 'all' ? `1=1` : `ls.status = ?`;
    const params = status === 'all' ? [] : [status];

    const [sessions] = await pool.query(
      `SELECT ls.*, v.store_name, v.store_logo, v.slug as vendor_slug, v.rating as vendor_rating,
              COUNT(DISTINCT lsp.product_id) as product_count
       FROM live_sessions ls
       JOIN vendors v ON ls.vendor_id = v.id
       LEFT JOIN live_session_products lsp ON lsp.session_id = ls.id AND lsp.is_active = 1
       WHERE ${where}
       GROUP BY ls.id, v.store_name, v.store_logo, v.slug, v.rating
       ORDER BY ls.status = 'live' DESC, ls.scheduled_at ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ sessions });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/live-shop/sessions/:id - single session with products
router.get('/sessions/:id', async (req, res) => {
  try {
    const [[session]] = await pool.query(
      `SELECT ls.*, v.store_name, v.store_logo, v.slug as vendor_slug
       FROM live_sessions ls JOIN vendors v ON ls.vendor_id = v.id
       WHERE ls.id = ?`,
      [req.params.id]
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock,
              lsp.special_price, lsp.is_active, lsp.sort_order
       FROM live_session_products lsp
       JOIN products p ON p.id = lsp.product_id
       WHERE lsp.session_id = ? AND p.status = 'active'
       ORDER BY lsp.is_active DESC, lsp.sort_order ASC`,
      [req.params.id]
    );

    res.json({
      session,
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        special_price: p.special_price ? Number(p.special_price) : null,
        effective_price: Number(p.special_price || p.sale_price || p.regular_price),
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// VENDOR: POST /api/live-shop/vendor/sessions - create session
router.post('/vendor/sessions', async (req, res) => {
  try {
    const { vendorId, title, description, thumbnail, streamUrl, scheduledAt } = req.body;
    if (!vendorId || !title) return res.status(400).json({ message: 'vendorId and title required' });

    const [r] = await pool.query(
      `INSERT INTO live_sessions (vendor_id, title, description, thumbnail, stream_url, scheduled_at) VALUES (?,?,?,?,?,?)`,
      [vendorId, title, description || null, thumbnail || null, streamUrl || null, scheduledAt || null]
    );

    res.status(201).json({ id: r.insertId, message: 'Session created' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// VENDOR: PUT /api/live-shop/vendor/sessions/:id/status
router.put('/vendor/sessions/:id/status', async (req, res) => {
  try {
    const { status, vendorId } = req.body;
    const validStatuses = ['scheduled', 'live', 'ended'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const extra = status === 'live' ? ', started_at = NOW()' : status === 'ended' ? ', ended_at = NOW()' : '';
    await pool.query(
      `UPDATE live_sessions SET status = ? ${extra} WHERE id = ? AND vendor_id = ?`,
      [status, req.params.id, vendorId]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// VENDOR: POST /api/live-shop/vendor/sessions/:id/products
router.post('/vendor/sessions/:id/products', async (req, res) => {
  try {
    const { productId, specialPrice, sortOrder = 0 } = req.body;
    await pool.query(
      `INSERT INTO live_session_products (session_id, product_id, special_price, sort_order) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE special_price = VALUES(special_price), sort_order = VALUES(sort_order)`,
      [req.params.id, productId, specialPrice || null, sortOrder]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/live-shop/vendor/:vendorId/sessions - vendor's own sessions
router.get('/vendor/:vendorId/sessions', async (req, res) => {
  try {
    const [sessions] = await pool.query(
      `SELECT ls.*, COUNT(DISTINCT lsp.product_id) as product_count
       FROM live_sessions ls
       LEFT JOIN live_session_products lsp ON lsp.session_id = ls.id
       WHERE ls.vendor_id = ?
       GROUP BY ls.id
       ORDER BY ls.created_at DESC LIMIT 20`,
      [req.params.vendorId]
    );
    res.json({ sessions });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
