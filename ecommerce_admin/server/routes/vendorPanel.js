/**
 * Vendor Panel API — all routes require vendor JWT auth
 * Prefix: /api/vendor
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const vendorAuth = require('../middleware/vendorAuth');

/* ── Dashboard ── */
router.get('/dashboard', vendorAuth, async (req, res) => {
  try {
    const vid = req.vendor.id;
    const [[orders]] = await pool.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) as delivered FROM orders WHERE id IN (SELECT DISTINCT order_id FROM order_items WHERE vendor_id=?)",
      [vid]
    );
    const [[products]] = await pool.query("SELECT COUNT(*) as total, SUM(stock) as total_stock FROM products WHERE vendor_id=?", [vid]);
    const [[wallet]] = await pool.query('SELECT * FROM vendor_wallets WHERE vendor_id=?', [vid]);
    const [recentOrders] = await pool.query(
      `SELECT o.*, GROUP_CONCAT(oi.product_name SEPARATOR ', ') as items_summary
       FROM orders o JOIN order_items oi ON oi.order_id=o.id
       WHERE oi.vendor_id=? GROUP BY o.id ORDER BY o.created_at DESC LIMIT 5`,
      [vid]
    );
    const [topProducts] = await pool.query(
      `SELECT p.id, p.name, p.thumbnail, p.stock, COALESCE(SUM(oi.quantity),0) as sold
       FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id AND oi.vendor_id=?
       WHERE p.vendor_id=? GROUP BY p.id ORDER BY sold DESC LIMIT 5`,
      [vid, vid]
    );
    res.json({
      stats: {
        totalOrders: orders.total || 0,
        pendingOrders: orders.pending || 0,
        deliveredOrders: orders.delivered || 0,
        totalProducts: products.total || 0,
        totalStock: products.total_stock || 0,
        walletBalance: Number(wallet?.current_balance || 0),
        pendingSettlement: Number(wallet?.pending_settlement || 0),
      },
      recentOrders, topProducts,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Products ── */
router.get('/products', vendorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = 'p.vendor_id=?';
    const params = [req.vendor.id];
    if (status) { where += ' AND p.status=?'; params.push(status); }
    if (search) { where += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM products p WHERE ${where}`, params);
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON c.id=p.category_id
       LEFT JOIN brands b ON b.id=p.brand_id
       WHERE ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ products: rows, total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/products', vendorAuth, async (req, res) => {
  try {
    const { name, slug, description, short_description, category_id, brand_id, product_type = 'non_perishable',
      regular_price, sale_price, compare_price, sku, barcode, stock, weight_kg = 0.5, status = 'draft', thumbnail } = req.body;
    if (!name || !regular_price) return res.status(400).json({ message: 'name and regular_price required' });
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const [r] = await pool.query(
      `INSERT INTO products (name, slug, description, short_description, category_id, brand_id, vendor_id, ownership_type, product_type,
       regular_price, sale_price, compare_price, sku, barcode, stock, weight_kg, status, thumbnail)
       VALUES (?,?,?,?,?,?,?,'vendor',?,?,?,?,?,?,?,?,?,?)`,
      [name, finalSlug, description || null, short_description || null, category_id || null, brand_id || null, req.vendor.id,
       product_type, regular_price, sale_price || null, compare_price || null, sku || null, barcode || null, stock || 0, weight_kg, status, thumbnail || null]
    );
    const [[created]] = await pool.query('SELECT * FROM products WHERE id=?', [r.insertId]);
    res.status(201).json(created);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/products/:id', vendorAuth, async (req, res) => {
  try {
    const [[prod]] = await pool.query('SELECT id FROM products WHERE id=? AND vendor_id=?', [req.params.id, req.vendor.id]);
    if (!prod) return res.status(404).json({ message: 'Product not found or not yours' });
    const { name, description, short_description, category_id, brand_id, regular_price, sale_price,
      compare_price, sku, barcode, stock, weight_kg, status, thumbnail, product_type } = req.body;
    await pool.query(
      `UPDATE products SET name=COALESCE(?,name), description=COALESCE(?,description), short_description=COALESCE(?,short_description),
       category_id=COALESCE(?,category_id), brand_id=COALESCE(?,brand_id), regular_price=COALESCE(?,regular_price),
       sale_price=COALESCE(?,sale_price), compare_price=COALESCE(?,compare_price), sku=COALESCE(?,sku), barcode=COALESCE(?,barcode),
       stock=COALESCE(?,stock), weight_kg=COALESCE(?,weight_kg), status=COALESCE(?,status), thumbnail=COALESCE(?,thumbnail),
       product_type=COALESCE(?,product_type) WHERE id=?`,
      [name, description, short_description, category_id, brand_id, regular_price, sale_price, compare_price,
       sku, barcode, stock, weight_kg, status, thumbnail, product_type, req.params.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM products WHERE id=?', [req.params.id]);
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/products/:id', vendorAuth, async (req, res) => {
  try {
    const [[prod]] = await pool.query('SELECT id FROM products WHERE id=? AND vendor_id=?', [req.params.id, req.vendor.id]);
    if (!prod) return res.status(404).json({ message: 'Not found' });
    await pool.query("UPDATE products SET status='archived' WHERE id=?", [req.params.id]);
    res.json({ message: 'Product archived' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Orders ── */
router.get('/orders', vendorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let havingClause = '';
    const params = [req.vendor.id];
    if (status) { havingClause = 'HAVING o.status=?'; params.push(status); }
    const [rows] = await pool.query(
      `SELECT o.*, GROUP_CONCAT(oi.product_name SEPARATOR ', ') as items_summary,
              SUM(oi.total) as vendor_total
       FROM orders o
       JOIN order_items oi ON oi.order_id=o.id AND oi.vendor_id=?
       GROUP BY o.id ${havingClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ orders: rows, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/orders/:id', vendorAuth, async (req, res) => {
  try {
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id=?', [req.params.id]);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=? AND vendor_id=?', [req.params.id, req.vendor.id]);
    if (!items.length) return res.status(403).json({ message: 'Access denied' });
    res.json({ ...order, items });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Shipments ── */
router.get('/shipments', vendorAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM shipments WHERE source_type='vendor' AND source_id=? ORDER BY created_at DESC LIMIT 50",
      [req.vendor.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Wallet ── */
router.get('/wallet', vendorAuth, async (req, res) => {
  try {
    const [[wallet]] = await pool.query('SELECT * FROM vendor_wallets WHERE vendor_id=?', [req.vendor.id]);
    const [transactions] = await pool.query(
      'SELECT * FROM vendor_wallet_transactions WHERE vendor_id=? ORDER BY created_at DESC LIMIT 50',
      [req.vendor.id]
    );
    res.json({ wallet, transactions });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Settlements ── */
router.get('/settlements', vendorAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM settlement_records WHERE vendor_id=? ORDER BY created_at DESC',
      [req.vendor.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Returns ── */
router.get('/returns', vendorAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rr.*, o.order_number, c.name as customer_name FROM return_requests rr
       LEFT JOIN orders o ON o.id=rr.order_id LEFT JOIN customers c ON c.id=rr.customer_id
       WHERE rr.vendor_id=? ORDER BY rr.created_at DESC`,
      [req.vendor.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Inventory ── */
router.get('/inventory', vendorAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, sku, stock, low_stock_threshold, status FROM products WHERE vendor_id=? ORDER BY stock ASC',
      [req.vendor.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/inventory/:productId', vendorAuth, async (req, res) => {
  try {
    const { stock } = req.body;
    const [[prod]] = await pool.query('SELECT id, stock FROM products WHERE id=? AND vendor_id=?', [req.params.productId, req.vendor.id]);
    if (!prod) return res.status(404).json({ message: 'Not found' });
    await pool.query('UPDATE products SET stock=? WHERE id=?', [stock, req.params.productId]);
    // Log movement
    await pool.query(
      "INSERT INTO inventory_movements (product_id, vendor_id, type, quantity, stock_before, stock_after, note) VALUES (?,?,?,?,?,?,?)",
      [req.params.productId, req.vendor.id, 'adjustment', stock - prod.stock, prod.stock, stock, 'Manual adjustment']
    ).catch(() => {});
    res.json({ message: 'Stock updated', stock });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Notifications ── */
router.get('/notifications', vendorAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vendor_notifications WHERE vendor_id=? ORDER BY created_at DESC LIMIT 30',
      [req.vendor.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/notifications/read-all', vendorAuth, async (req, res) => {
  try {
    await pool.query('UPDATE vendor_notifications SET is_read=1 WHERE vendor_id=?', [req.vendor.id]);
    res.json({ message: 'All marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Analytics ── */
router.get('/analytics', vendorAuth, async (req, res) => {
  try {
    const vid = req.vendor.id;
    const [salesByDay] = await pool.query(
      `SELECT DATE(o.created_at) as date, COUNT(DISTINCT o.id) as orders, SUM(oi.total) as revenue
       FROM orders o JOIN order_items oi ON oi.order_id=o.id AND oi.vendor_id=?
       WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND o.status != 'cancelled'
       GROUP BY DATE(o.created_at) ORDER BY date ASC`,
      [vid]
    );
    const [topProducts] = await pool.query(
      `SELECT p.name, p.thumbnail, SUM(oi.quantity) as qty_sold, SUM(oi.total) as revenue
       FROM order_items oi JOIN products p ON p.id=oi.product_id
       WHERE oi.vendor_id=? GROUP BY oi.product_id ORDER BY revenue DESC LIMIT 10`,
      [vid]
    );
    res.json({ salesByDay, topProducts });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
