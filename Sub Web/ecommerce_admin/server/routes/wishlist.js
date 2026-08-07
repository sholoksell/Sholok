const express = require('express');
const router = express.Router();
const pool = require('../db');
const customerAuth = require('../middleware/customerAuth');

// GET /api/wishlist — customer's wishlist with full product details
router.get('/', customerAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cw.added_at,
              p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price,
              p.stock, p.status,
              c.name AS category_name, v.store_name AS vendor_name, v.slug AS vendor_slug
       FROM customer_wishlist cw
       JOIN products p ON p.id = cw.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN vendors v ON v.id = p.vendor_id
       WHERE cw.customer_id = ? ORDER BY cw.added_at DESC`,
      [req.customer.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/wishlist/add — add product to wishlist
router.post('/add', customerAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    // INSERT IGNORE prevents duplicates
    await pool.query('INSERT IGNORE INTO customer_wishlist (customer_id, product_id) VALUES (?, ?)', [req.customer.id, productId]);
    res.json({ message: 'Added to wishlist' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/wishlist/remove — remove product from wishlist
router.post('/remove', customerAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    await pool.query('DELETE FROM customer_wishlist WHERE customer_id = ? AND product_id = ?', [req.customer.id, productId]);
    res.json({ message: 'Removed from wishlist' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/wishlist/check/:productId
router.get('/check/:productId', customerAuth, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id FROM customer_wishlist WHERE customer_id = ? AND product_id = ?',
      [req.customer.id, req.params.productId]
    );
    res.json({ isInWishlist: !!row });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
