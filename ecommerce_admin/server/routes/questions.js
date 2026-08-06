const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const customerAuthMiddleware = require('../middleware/customerAuth');

const VENDOR_SECRET = process.env.VENDOR_JWT_SECRET || 'sholok_vendor_jwt_secret_2024';

// Middleware: admin OR vendor auth (for answering questions)
const adminOrVendorAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });
  const token = header.replace('Bearer ', '');
  // Try admin token first
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    return next();
  } catch (_) {}
  // Try vendor token
  try {
    const decoded = jwt.verify(token, VENDOR_SECRET);
    if (decoded.type !== 'vendor') return res.status(401).json({ message: 'Invalid token type' });
    const [[vendor]] = await pool.query("SELECT * FROM vendors WHERE id=? AND status='active'", [decoded.id]);
    if (!vendor) return res.status(401).json({ message: 'Vendor not found or not active' });
    req.vendor = vendor;
    return next();
  } catch (_) {}
  return res.status(401).json({ message: 'Invalid or expired token' });
};

// GET /api/questions/product/:productId — public, answered + public questions
router.get('/product/:productId', async (req, res) => {
  try {
    const [questions] = await pool.query(
      `SELECT q.id, q.question, q.answer, q.created_at, q.updated_at,
              c.name AS customer_name
       FROM questions q
       LEFT JOIN customers c ON c.id = q.customer_id
       WHERE q.product_id = ? AND q.is_public = 1 AND q.status = 'answered'
       ORDER BY q.created_at DESC`,
      [req.params.productId]
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/questions/admin — admin auth, all questions with filters
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const { status, productId } = req.query;
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('q.status = ?');
      params.push(status);
    }
    if (productId) {
      conditions.push('q.product_id = ?');
      params.push(productId);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [questions] = await pool.query(
      `SELECT q.*,
              c.name AS customer_name, c.email AS customer_email,
              p.name AS product_name
       FROM questions q
       LEFT JOIN customers c ON c.id = q.customer_id
       LEFT JOIN products p ON p.id = q.product_id
       ${where}
       ORDER BY q.created_at DESC`,
      params
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/questions — customer auth, submit a question
router.post('/', customerAuthMiddleware, async (req, res) => {
  try {
    const { product_id, question } = req.body;
    if (!product_id || !question?.trim()) {
      return res.status(400).json({ message: 'product_id and question are required' });
    }
    const customer_id = req.customer.id;
    const [result] = await pool.query(
      `INSERT INTO questions (product_id, customer_id, question, status, is_public)
       VALUES (?, ?, ?, 'pending', 1)`,
      [product_id, customer_id, question.trim()]
    );
    const [[saved]] = await pool.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/questions/:id/answer — admin or vendor auth
router.patch('/:id/answer', adminOrVendorAuth, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) {
      return res.status(400).json({ message: 'answer is required' });
    }

    // If vendor: verify the question belongs to one of their products
    if (req.vendor) {
      const [[q]] = await pool.query(
        `SELECT q.id FROM questions q
         JOIN products p ON p.id = q.product_id
         WHERE q.id = ? AND p.vendor_id = ?`,
        [req.params.id, req.vendor.id]
      );
      if (!q) return res.status(403).json({ message: 'Question not found or not yours' });
    }

    const answeredBy = req.admin ? req.admin.id : req.vendor.id;
    await pool.query(
      `UPDATE questions SET answer = ?, answered_by = ?, status = 'answered', updated_at = NOW()
       WHERE id = ?`,
      [answer.trim(), answeredBy, req.params.id]
    );
    const [[saved]] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Question not found' });
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/questions/:id/status — admin auth
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'answered', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await pool.query('UPDATE questions SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    const [[saved]] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Question not found' });
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/questions/:id — admin auth
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[q]] = await pool.query('SELECT id FROM questions WHERE id = ?', [req.params.id]);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
