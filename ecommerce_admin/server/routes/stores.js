/**
 * Public Vendor Store API
 * No auth required — used by frontend customer-facing store pages
 * Prefix: /api/stores
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/stores — list all active vendor stores
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = "v.status='active'";
    const params = [];
    if (search) { where += ' AND (v.store_name LIKE ? OR v.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM vendors v WHERE ${where}`, params);
    const [rows] = await pool.query(
      `SELECT v.id, v.name, v.slug, v.store_name, v.store_logo, v.store_banner, v.store_description,
              v.rating, v.rating_count, v.total_orders, v.total_sales, v.district, v.division,
              COUNT(p.id) as product_count
       FROM vendors v
       LEFT JOIN products p ON p.vendor_id=v.id AND p.status='active'
       WHERE ${where} GROUP BY v.id ORDER BY v.total_sales DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ stores: rows, total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/stores/:slug — single vendor store with products
router.get('/:slug', async (req, res) => {
  try {
    const [[vendor]] = await pool.query(
      `SELECT v.id, v.name, v.slug, v.store_name, v.store_logo, v.store_banner, v.store_description,
              v.store_policies, v.rating, v.rating_count, v.total_orders, v.total_sales,
              v.division, v.district, v.upazila, v.created_at,
              COUNT(DISTINCT p.id) as product_count
       FROM vendors v
       LEFT JOIN products p ON p.vendor_id=v.id AND p.status='active'
       WHERE v.slug=? AND v.status='active' GROUP BY v.id`,
      [req.params.slug]
    );
    if (!vendor) return res.status(404).json({ message: 'Store not found' });

    const { page = 1, limit = 20, sort = 'newest', category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = 'p.vendor_id=? AND p.status=\'active\'';
    const productParams = [vendor.id];
    if (category) { where += ' AND p.category_id=?'; productParams.push(category); }
    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.regular_price ASC';
    else if (sort === 'price_desc') orderBy = 'p.regular_price DESC';
    else if (sort === 'popular') orderBy = 'p.stock DESC';

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock,
              p.product_type, c.name as category_name
       FROM products p LEFT JOIN categories c ON c.id=p.category_id
       WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...productParams, Number(limit), offset]
    );

    const [reviews] = await pool.query(
      `SELECT vr.*, c.name as customer_name FROM vendor_reviews vr
       LEFT JOIN customers c ON c.id=vr.customer_id
       WHERE vr.vendor_id=? AND vr.status='approved' ORDER BY vr.created_at DESC LIMIT 10`,
      [vendor.id]
    );

    res.json({ vendor, products, reviews, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/stores/:slug/follow — customer follows a store (requires customer token in header)
router.post('/:slug/follow', async (req, res) => {
  try {
    const [[vendor]] = await pool.query('SELECT id FROM vendors WHERE slug=?', [req.params.slug]);
    if (!vendor) return res.status(404).json({ message: 'Store not found' });
    const { customer_id } = req.body;
    if (!customer_id) return res.status(400).json({ message: 'customer_id required' });
    await pool.query(
      'INSERT IGNORE INTO vendor_followers (vendor_id, customer_id) VALUES (?,?)',
      [vendor.id, customer_id]
    );
    res.json({ message: 'Store followed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/stores/:slug/follow
router.delete('/:slug/follow', async (req, res) => {
  try {
    const [[vendor]] = await pool.query('SELECT id FROM vendors WHERE slug=?', [req.params.slug]);
    if (!vendor) return res.status(404).json({ message: 'Store not found' });
    const { customer_id } = req.body;
    await pool.query('DELETE FROM vendor_followers WHERE vendor_id=? AND customer_id=?', [vendor.id, customer_id]);
    res.json({ message: 'Unfollowed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
