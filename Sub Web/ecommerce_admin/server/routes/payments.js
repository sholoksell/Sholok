const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function fmtPayment(row) {
  if (!row) return null;
  return {
    _id:           row.id,
    orderId:       row.order_id !== undefined && row.order_number !== undefined
      ? { _id: row.order_id, orderNumber: row.order_number, total: row.order_total }
      : row.order_id,
    transactionId: row.transaction_id,
    amount:        row.amount,
    method:        row.method,
    status:        row.status,
    gateway:       row.gateway,
    notes:         row.notes,
    verified:      !!row.verified,
    proofImage:    row.proof_image,
    refundAmount:  row.refund_amount,
    refundType:    row.refund_type,
    refundReason:  row.refund_reason,
    refundTo:      row.refund_to,
    refundedAt:    row.refunded_at,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

// Export CSV
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { status, method, from, to } = req.query;
    const conditions = [];
    const params = [];
    if (status) { conditions.push('p.status = ?'); params.push(status); }
    if (method) { conditions.push('p.method = ?'); params.push(method); }
    if (from)   { conditions.push('p.created_at >= ?'); params.push(new Date(from)); }
    if (to)     { conditions.push('p.created_at <= ?'); params.push(new Date(to + 'T23:59:59')); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [payments] = await pool.query(
      `SELECT p.*, o.order_number, o.total AS order_total
       FROM payments p LEFT JOIN orders o ON o.id = p.order_id
       ${where} ORDER BY p.created_at DESC`,
      params
    );

    const rows = [['Transaction ID', 'Order #', 'Amount', 'Method', 'Status', 'Date', 'Notes']];
    payments.forEach(p => {
      rows.push([
        p.transaction_id || '', p.order_number || '',
        p.amount, p.method || '', p.status,
        new Date(p.created_at).toISOString().split('T')[0],
        p.notes || '',
      ]);
    });

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, method } = req.query;
    const conditions = [];
    const params = [];
    if (status) { conditions.push('p.status = ?'); params.push(status); }
    if (method) { conditions.push('p.method = ?'); params.push(method); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [payments] = await pool.query(
      `SELECT p.*, o.order_number, o.total AS order_total
       FROM payments p LEFT JOIN orders o ON o.id = p.order_id
       ${where} ORDER BY p.created_at DESC`,
      params
    );
    res.json(payments.map(fmtPayment));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[payment]] = await pool.query(
      `SELECT p.*, o.order_number, o.total AS order_total,
              c.name AS customer_name, c.email AS customer_email
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE p.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const fmt = fmtPayment(payment);
    if (payment.customer_name) {
      fmt.orderId = {
        _id: payment.order_id, orderNumber: payment.order_number, total: payment.order_total,
        customerId: { _id: null, name: payment.customer_name, email: payment.customer_email },
      };
    }
    res.json(fmt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderId, transactionId, amount, method, status = 'pending', gateway = '', notes = '', proofImage = '' } = req.body;
    const txId = transactionId || `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const [result] = await pool.query(
      `INSERT INTO payments (order_id, transaction_id, amount, method, status, gateway, notes, proof_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId || null, txId, amount, method, status, gateway, notes, proofImage]
    );

    const [[saved]] = await pool.query(
      'SELECT p.*, o.order_number, o.total AS order_total FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.id = ?',
      [result.insertId]
    );
    res.status(201).json(fmtPayment(saved));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Transaction ID already exists' });
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { transactionId, amount, method, status, gateway, notes } = req.body;
    const fields = {};
    if (transactionId !== undefined) fields.transaction_id = transactionId;
    if (amount !== undefined)        fields.amount = amount;
    if (method !== undefined)        fields.method = method;
    if (status !== undefined)        fields.status = status;
    if (gateway !== undefined)       fields.gateway = gateway;
    if (notes !== undefined)         fields.notes = notes;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE payments SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const [[saved]] = await pool.query(
      'SELECT p.*, o.order_number, o.total AS order_total FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.id = ?',
      [req.params.id]
    );
    if (!saved) return res.status(404).json({ message: 'Payment not found' });
    res.json(fmtPayment(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const fields = { status };
    if (notes !== undefined) fields.notes = notes;
    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE payments SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    const [[saved]] = await pool.query(
      'SELECT p.*, o.order_number, o.total AS order_total FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.id = ?',
      [req.params.id]
    );
    if (!saved) return res.status(404).json({ message: 'Payment not found' });
    res.json(fmtPayment(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process refund
router.post('/:id/refund', authMiddleware, async (req, res) => {
  try {
    const { refundAmount, refundType, refundReason, refundTo } = req.body;
    const [[payment]] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [req.params.id]);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const amount = refundAmount || payment.amount;
    const newNotes = (payment.notes ? payment.notes + '\n' : '') + `Refund: ${refundReason || ''}`;

    await pool.query(
      `UPDATE payments SET status = 'refunded', refund_amount = ?, refund_type = ?, refund_reason = ?, refund_to = ?, refunded_at = NOW(), notes = ? WHERE id = ?`,
      [amount, refundType || 'full', refundReason || '', refundTo || '', newNotes, req.params.id]
    );

    if (payment.order_id) {
      await pool.query("UPDATE orders SET payment_status = 'refunded' WHERE id = ?", [payment.order_id]);
    }

    const [[saved]] = await pool.query(
      'SELECT p.*, o.order_number, o.total AS order_total FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.id = ?',
      [req.params.id]
    );
    res.json(fmtPayment(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify payment
router.patch('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { verified, notes } = req.body;
    const newStatus = verified ? 'completed' : 'failed';
    await pool.query(
      'UPDATE payments SET verified = ?, status = ?, notes = ? WHERE id = ?',
      [verified ? 1 : 0, newStatus, notes || '', req.params.id]
    );

    const [[payment]] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [req.params.id]);
    if (verified && payment && payment.order_id) {
      await pool.query("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [payment.order_id]);
    }

    const [[saved]] = await pool.query(
      'SELECT p.*, o.order_number, o.total AS order_total FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.id = ?',
      [req.params.id]
    );
    if (!saved) return res.status(404).json({ message: 'Payment not found' });
    res.json(fmtPayment(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[p]] = await pool.query('SELECT id FROM payments WHERE id = ? LIMIT 1', [req.params.id]);
    if (!p) return res.status(404).json({ message: 'Payment not found' });
    await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
