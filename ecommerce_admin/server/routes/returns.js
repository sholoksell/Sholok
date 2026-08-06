const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const customerAuthMiddleware = require('../middleware/customerAuth');

function genReturnNumber() {
  return 'RET' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function fmt(r) {
  return {
    _id: r.id, returnNumber: r.return_number, orderId: r.order_id, orderItemId: r.order_item_id,
    customerId: r.customer_id, vendorId: r.vendor_id,
    reason: r.reason, description: r.description,
    images: r.images ? JSON.parse(r.images) : [],
    status: r.status, type: r.type,
    refundAmount: r.refund_amount ? Number(r.refund_amount) : null,
    refundMethod: r.refund_method, adminNote: r.admin_note,
    resolvedAt: r.resolved_at, createdAt: r.created_at, updatedAt: r.updated_at,
    customerName: r.customer_name, orderNumber: r.order_number,
    productName: r.product_name,
  };
}

// Customer: POST /api/returns — submit return/refund request
router.post('/', customerAuthMiddleware, async (req, res) => {
  try {
    const { order_id, order_item_id, reason, description, images = [], type = 'return' } = req.body;
    if (!order_id || !reason) return res.status(400).json({ message: 'order_id and reason required' });

    // Verify order belongs to customer
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id=? AND customer_id=?', [order_id, req.customer.id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['delivered'].includes(order.status)) return res.status(400).json({ message: 'Can only return delivered orders' });

    let vendorId = null;
    let refundAmount = null;
    if (order_item_id) {
      const [[item]] = await pool.query('SELECT * FROM order_items WHERE id=? AND order_id=?', [order_item_id, order_id]);
      if (item) { vendorId = item.vendor_id; refundAmount = Number(item.total); }
    } else {
      refundAmount = Number(order.total);
    }

    const [r] = await pool.query(
      `INSERT INTO return_requests (return_number, order_id, order_item_id, customer_id, vendor_id, reason, description, images, status, type, refund_amount)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [genReturnNumber(), order_id, order_item_id || null, req.customer.id, vendorId, reason, description || null, JSON.stringify(images), 'pending', type, refundAmount]
    );

    // Notify admin
    await pool.query(
      "INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (?,?,?,?,?)",
      [1, 'admin', 'New Return Request', `Customer submitted a ${type} request for order #${order.order_number}`, 'return']
    ).catch(() => {});

    res.status(201).json({ _id: r.insertId, returnNumber: genReturnNumber(), message: 'Return request submitted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Customer: GET /api/returns/my — customer's own return requests
router.get('/my', customerAuthMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rr.*, o.order_number, c.name as customer_name, oi.product_name
       FROM return_requests rr
       LEFT JOIN orders o ON o.id=rr.order_id
       LEFT JOIN customers c ON c.id=rr.customer_id
       LEFT JOIN order_items oi ON oi.id=rr.order_item_id
       WHERE rr.customer_id=? ORDER BY rr.created_at DESC`,
      [req.customer.id]
    );
    res.json(rows.map(fmt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: GET /api/returns — all return requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = '1=1';
    const params = [];
    if (status) { where += ' AND rr.status=?'; params.push(status); }
    if (type) { where += ' AND rr.type=?'; params.push(type); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM return_requests rr WHERE ${where}`, params);
    const [rows] = await pool.query(
      `SELECT rr.*, o.order_number, c.name as customer_name, oi.product_name
       FROM return_requests rr
       LEFT JOIN orders o ON o.id=rr.order_id
       LEFT JOIN customers c ON c.id=rr.customer_id
       LEFT JOIN order_items oi ON oi.id=rr.order_item_id
       WHERE ${where} ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ returns: rows.map(fmt), total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: PUT /api/returns/:id — update status/refund
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, admin_note, refund_amount, refund_method } = req.body;
    const resolved = ['approved', 'rejected', 'refunded'].includes(status) ? new Date() : null;
    await pool.query(
      'UPDATE return_requests SET status=COALESCE(?,status), admin_note=COALESCE(?,admin_note), refund_amount=COALESCE(?,refund_amount), refund_method=COALESCE(?,refund_method), resolved_at=COALESCE(?,resolved_at) WHERE id=?',
      [status, admin_note, refund_amount, refund_method, resolved, req.params.id]
    );

    // Notify customer
    const [[ret]] = await pool.query('SELECT * FROM return_requests WHERE id=?', [req.params.id]);
    if (ret && status) {
      await pool.query(
        "INSERT INTO customer_notifications (customer_id, title, message, type) VALUES (?,?,?,?)",
        [ret.customer_id, `Return Request ${status}`, `Your return request ${ret.return_number} has been ${status}`, 'info']
      ).catch(() => {});
    }

    const [[updated]] = await pool.query('SELECT * FROM return_requests WHERE id=?', [req.params.id]);
    res.json(fmt(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Vendor: GET /api/returns/vendor/:vendorId
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rr.*, o.order_number, c.name as customer_name, oi.product_name
       FROM return_requests rr
       LEFT JOIN orders o ON o.id=rr.order_id
       LEFT JOIN customers c ON c.id=rr.customer_id
       LEFT JOIN order_items oi ON oi.id=rr.order_item_id
       WHERE rr.vendor_id=? ORDER BY rr.created_at DESC LIMIT 50`,
      [req.params.vendorId]
    );
    res.json(rows.map(fmt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
