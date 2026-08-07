const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const reviewUploadsDir = path.join(__dirname, '..', 'uploads', 'reviews');
if (!fs.existsSync(reviewUploadsDir)) fs.mkdirSync(reviewUploadsDir, { recursive: true });

const reviewImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reviewUploadsDir),
  filename: (req, file, cb) => cb(null, `rev-${Date.now()}-${Math.random().toString(36).substr(2,6)}${path.extname(file.originalname).toLowerCase()}`),
});
const reviewUpload = multer({ storage: reviewImageStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')) });

function fmtReview(row) {
  let images = [];
  if (row.images) {
    try { images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images; } catch {}
  }
  return {
    _id:        row.id,
    productId:  row.product_id ? { _id: row.product_id, name: row.product_name, thumbnail: row.product_thumbnail } : null,
    customerId: row.customer_id ? { _id: row.customer_id, name: row.customer_name, email: row.customer_email } : null,
    rating:     row.rating,
    title:      row.title,
    comment:    row.comment,
    status:     row.status,
    images,
    isVerifiedPurchase: !!row.is_verified_purchase,
    helpfulCount: row.helpful_count || 0,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

// Get all reviews (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, productId, search } = req.query;
    const conditions = [];
    const params = [];

    if (status)    { conditions.push('r.status = ?');     params.push(status); }
    if (productId) { conditions.push('r.product_id = ?'); params.push(productId); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [reviews] = await pool.query(
      `SELECT r.*,
              p.name AS product_name, p.thumbnail AS product_thumbnail,
              c.name AS customer_name, c.email AS customer_email
       FROM reviews r
       LEFT JOIN products  p ON p.id = r.product_id
       LEFT JOIN customers c ON c.id = r.customer_id
       ${where} ORDER BY r.created_at DESC`,
      params
    );

    let result = reviews.map(fmtReview);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r =>
        (r.customerId?.name || '').toLowerCase().includes(s) ||
        (r.productId?.name  || '').toLowerCase().includes(s) ||
        (r.comment          || '').toLowerCase().includes(s)
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, c.name AS customer_name
       FROM reviews r LEFT JOIN customers c ON c.id = r.customer_id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json(reviews.map(fmtReview));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ total }]]    = await pool.query('SELECT COUNT(*) AS total FROM reviews');
    const [[{ pending }]]  = await pool.query("SELECT COUNT(*) AS pending FROM reviews WHERE status = 'pending'");
    const [[{ approved }]] = await pool.query("SELECT COUNT(*) AS approved FROM reviews WHERE status = 'approved'");
    const [[{ rejected }]] = await pool.query("SELECT COUNT(*) AS rejected FROM reviews WHERE status = 'rejected'");
    const [[avgRow]]       = await pool.query("SELECT COALESCE(AVG(rating), 0) AS avg FROM reviews WHERE status = 'approved'");

    res.json({ total: Number(total), pending: Number(pending), approved: Number(approved), rejected: Number(rejected), averageRating: Number(avgRow.avg) || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create review (customer-side, no auth)
router.post('/', async (req, res) => {
  try {
    const { productId, customerId, rating, title = '', comment = '', images } = req.body;

    // Check if verified purchase
    let isVerified = 0;
    if (customerId && productId) {
      const [[orderItem]] = await pool.query(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.customer_id = ? AND oi.product_id = ? AND o.status NOT IN ('cancelled','refunded')
         LIMIT 1`,
        [customerId, productId]
      );
      isVerified = orderItem ? 1 : 0;
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, customer_id, rating, title, comment, images, is_verified_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productId, customerId || null, rating, title, comment, images ? JSON.stringify(images) : null, isVerified]
    );
    const [[saved]] = await pool.query(
      `SELECT r.*, p.name AS product_name, p.thumbnail AS product_thumbnail, c.name AS customer_name, c.email AS customer_email
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id LEFT JOIN customers c ON c.id = r.customer_id
       WHERE r.id = ? LIMIT 1`,
      [result.insertId]
    );
    res.status(201).json(fmtReview(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    const [[saved]] = await pool.query(
      `SELECT r.*, p.name AS product_name, p.thumbnail AS product_thumbnail, c.name AS customer_name, c.email AS customer_email
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id LEFT JOIN customers c ON c.id = r.customer_id
       WHERE r.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!saved) return res.status(404).json({ message: 'Review not found' });
    res.json(fmtReview(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[r]] = await pool.query('SELECT id FROM reviews WHERE id = ? LIMIT 1', [req.params.id]);
    if (!r) return res.status(404).json({ message: 'Review not found' });
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update status
router.post('/bulk-status', authMiddleware, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No ids' });
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`UPDATE reviews SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
    res.json({ message: `${ids.length} reviews updated` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk delete
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No ids' });
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM reviews WHERE id IN (${placeholders})`, ids);
    res.json({ message: `${ids.length} reviews deleted` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/reviews/:id/helpful - toggle helpful vote
// POST /api/reviews/upload-image — upload a single review image (public, no auth required)
router.post('/upload-image', reviewUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  const url = `/uploads/reviews/${req.file.filename}`;
  res.json({ url });
});

router.post('/:id/helpful', async (req, res) => {
  try {
    const { customerId, isHelpful = true } = req.body;
    if (!customerId) return res.status(400).json({ message: 'customerId required' });

    await pool.query(
      `INSERT INTO review_helpful_votes (review_id, customer_id, is_helpful) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE is_helpful = VALUES(is_helpful)`,
      [req.params.id, customerId, isHelpful ? 1 : 0]
    );

    // Update helpful_count
    await pool.query(
      `UPDATE reviews SET helpful_count = (
         SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = ? AND is_helpful = 1
       ) WHERE id = ?`,
      [req.params.id, req.params.id]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
