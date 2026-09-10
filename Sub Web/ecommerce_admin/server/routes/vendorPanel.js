/**
 * Vendor Panel API — all routes require vendor JWT auth
 * Prefix: /api/vendor
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const vendorAuth = require('../middleware/vendorAuth');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

/* ── Upload helpers ── */
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const slugifyFilename = (text) => {
  if (!text) return '';
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);
};

const vendorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = slugifyFilename(req.body.name) || slugifyFilename(path.basename(file.originalname, ext)) || 'image';
    let candidate = `${base}${ext}`;
    let n = 2;
    while (fs.existsSync(path.join(uploadDir, candidate))) { candidate = `${base}-${n++}${ext}`; }
    cb(null, candidate);
  },
});
const vendorUpload = multer({ storage: vendorStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase()) && /image/.test(file.mimetype)
    ? cb(null, true) : cb(new Error('Only image files are allowed'));
}});

/* ── Product image/tag helpers ── */
async function saveImages(conn, productId, images) {
  await conn.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
  if (images && images.length) {
    const vals = images.map((url, i) => [productId, url, i]);
    await conn.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?', [vals]);
  }
}

async function saveTags(conn, productId, tags) {
  await conn.query('DELETE FROM product_tags WHERE product_id = ?', [productId]);
  if (tags && tags.length) {
    const vals = [...new Set(tags)].map(t => [productId, t]);
    await conn.query('INSERT INTO product_tags (product_id, tag) VALUES ?', [vals]);
  }
}

function fmtProduct(row) {
  if (!row) return null;
  return {
    ...row,
    images: row.images_list ? row.images_list.split('|||').filter(Boolean) : (row.thumbnail ? [row.thumbnail] : []),
    tags:   row.tags_list   ? row.tags_list.split('|||').filter(Boolean)   : [],
    images_list: undefined,
    tags_list:   undefined,
  };
}

/* ── Upload ── */
router.post('/upload/multiple', vendorAuth, vendorUpload.array('images', 10), (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message: 'No files uploaded' });
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

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
      `SELECT p.*, c.name as category_name, b.name as brand_name,
       GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.sort_order SEPARATOR '|||') as images_list,
       GROUP_CONCAT(DISTINCT pt.tag SEPARATOR '|||') as tags_list
       FROM products p
       LEFT JOIN categories c ON c.id=p.category_id
       LEFT JOIN brands b ON b.id=p.brand_id
       LEFT JOIN product_images pi ON pi.product_id=p.id
       LEFT JOIN product_tags pt ON pt.product_id=p.id
       WHERE ${where} GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ products: rows.map(fmtProduct), total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/products', vendorAuth, async (req, res) => {
  try {
    let { name, nameBn = '', slug, description = '', descriptionBn = '', shortDescription = '', shortDescriptionBn = '',
      category_id, brand_id, product_type = 'non_perishable', regular_price, sale_price, compare_price,
      sku, barcode, stock = 0, weight_kg = 0, status = 'draft', thumbnail = '', images = [], tags = [],
      featured = false, is_new = false, on_sale = false, visibility = 'visible',
      low_stock_threshold = 10, shipping_class = 'standard', shipping_charge = 0,
      meta_title = '', meta_description = '',
      scheduled_publish_date = null, availability_date = null } = req.body;
    if (!name || !regular_price) return res.status(400).json({ message: 'name and regular_price required' });
    if (!sku) sku = 'VND-' + req.vendor.id + '-' + Date.now();
    if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!thumbnail && images.length) thumbnail = images[0];
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [r] = await conn.query(
        `INSERT INTO products (name, name_bn, slug, description, description_bn, short_description, short_description_bn,
         category_id, brand_id, vendor_id, ownership_type, product_type, regular_price, sale_price, compare_price,
         sku, barcode, stock, weight_kg, status, thumbnail, featured, is_new, on_sale, visibility,
         low_stock_threshold, shipping_class, shipping_charge, meta_title, meta_description,
         scheduled_publish_date, availability_date)
         VALUES (?,?,?,?,?,?,?,?,?,?,'vendor',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [name, nameBn || null, slug, description, descriptionBn || null, shortDescription, shortDescriptionBn || null,
         category_id || null, brand_id || null, req.vendor.id, product_type,
         regular_price, sale_price || null, compare_price || null,
         sku || null, barcode || null, stock, weight_kg, status, thumbnail,
         featured ? 1 : 0, is_new ? 1 : 0, on_sale ? 1 : 0, visibility,
         low_stock_threshold, shipping_class, shipping_charge,
         meta_title || null, meta_description || null,
         scheduled_publish_date || null, availability_date || null]
      );
      await saveImages(conn, r.insertId, images);
      await saveTags(conn, r.insertId, tags);
      await conn.commit();
      const [[created]] = await pool.query(
        `SELECT p.*, GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.sort_order SEPARATOR '|||') as images_list,
         GROUP_CONCAT(DISTINCT pt.tag SEPARATOR '|||') as tags_list
         FROM products p
         LEFT JOIN product_images pi ON pi.product_id = p.id
         LEFT JOIN product_tags pt ON pt.product_id = p.id
         WHERE p.id=? GROUP BY p.id`, [r.insertId]);
      res.status(201).json(fmtProduct(created));
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/products/:id', vendorAuth, async (req, res) => {
  try {
    const [[prod]] = await pool.query('SELECT id FROM products WHERE id=? AND vendor_id=?', [req.params.id, req.vendor.id]);
    if (!prod) return res.status(404).json({ message: 'Product not found or not yours' });
    const { name, nameBn, slug, description, descriptionBn, shortDescription, shortDescriptionBn,
      category_id, brand_id, product_type, regular_price, sale_price, compare_price,
      sku, barcode, stock, weight_kg, status, thumbnail, images, tags,
      featured, is_new, on_sale, visibility, low_stock_threshold,
      shipping_class, shipping_charge, meta_title, meta_description,
      scheduled_publish_date, availability_date } = req.body;
    const fields = {};
    if (name !== undefined)                  fields.name                   = name;
    if (nameBn !== undefined)                fields.name_bn                = nameBn || null;
    if (slug !== undefined)                  fields.slug                   = slug;
    if (description !== undefined)           fields.description            = description;
    if (descriptionBn !== undefined)         fields.description_bn         = descriptionBn || null;
    if (shortDescription !== undefined)      fields.short_description      = shortDescription;
    if (shortDescriptionBn !== undefined)    fields.short_description_bn   = shortDescriptionBn || null;
    if (category_id !== undefined)           fields.category_id            = category_id || null;
    if (brand_id !== undefined)              fields.brand_id               = brand_id || null;
    if (product_type !== undefined)          fields.product_type           = product_type;
    if (regular_price !== undefined)         fields.regular_price          = regular_price;
    if (sale_price !== undefined)            fields.sale_price             = sale_price || null;
    if (compare_price !== undefined)         fields.compare_price          = compare_price || null;
    if (sku !== undefined)                   fields.sku                    = sku;
    if (barcode !== undefined)               fields.barcode                = barcode || null;
    if (stock !== undefined)                 fields.stock                  = stock;
    if (weight_kg !== undefined)             fields.weight_kg              = weight_kg;
    if (status !== undefined)                fields.status                 = status;
    if (thumbnail !== undefined)             fields.thumbnail              = thumbnail || null;
    if (featured !== undefined)              fields.featured               = featured ? 1 : 0;
    if (is_new !== undefined)                fields.is_new                 = is_new ? 1 : 0;
    if (on_sale !== undefined)               fields.on_sale                = on_sale ? 1 : 0;
    if (visibility !== undefined)            fields.visibility             = visibility;
    if (low_stock_threshold !== undefined)   fields.low_stock_threshold    = low_stock_threshold;
    if (shipping_class !== undefined)        fields.shipping_class         = shipping_class;
    if (shipping_charge !== undefined)       fields.shipping_charge        = shipping_charge;
    if (meta_title !== undefined)            fields.meta_title             = meta_title || null;
    if (meta_description !== undefined)      fields.meta_description       = meta_description || null;
    if (scheduled_publish_date !== undefined) fields.scheduled_publish_date = scheduled_publish_date || null;
    if (availability_date !== undefined)     fields.availability_date      = availability_date || null;

    if (!thumbnail && Array.isArray(images) && images.length) fields.thumbnail = images[0];

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (Object.keys(fields).length) {
        const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        await conn.query(`UPDATE products SET ${setClauses} WHERE id=?`, [...Object.values(fields), req.params.id]);
      }
      if (Array.isArray(images)) await saveImages(conn, req.params.id, images);
      if (Array.isArray(tags))   await saveTags(conn, req.params.id, tags);
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    const [[updated]] = await pool.query(
      `SELECT p.*, GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.sort_order SEPARATOR '|||') as images_list,
       GROUP_CONCAT(DISTINCT pt.tag SEPARATOR '|||') as tags_list
       FROM products p
       LEFT JOIN product_images pi ON pi.product_id = p.id
       LEFT JOIN product_tags pt ON pt.product_id = p.id
       WHERE p.id=? GROUP BY p.id`, [req.params.id]);

    res.json(fmtProduct(updated));
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

/* ── Vendor Settings tables init ── */
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_settings (
        vendor_id INT PRIMARY KEY,
        notif_order TINYINT(1) DEFAULT 1,
        notif_product TINYINT(1) DEFAULT 1,
        notif_payment TINYINT(1) DEFAULT 1,
        notif_review TINYINT(1) DEFAULT 1,
        notif_chat TINYINT(1) DEFAULT 1,
        auto_reply_enabled TINYINT(1) DEFAULT 0,
        auto_reply_message TEXT,
        business_hours_start VARCHAR(5) DEFAULT '09:00',
        business_hours_end VARCHAR(5) DEFAULT '18:00',
        handling_time INT DEFAULT 1,
        default_shipping VARCHAR(100) DEFAULT 'standard',
        invoice_prefix VARCHAR(20) DEFAULT 'INV',
        invoice_start INT DEFAULT 1001,
        invoice_current INT DEFAULT 1001,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_quick_replies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);
    const alterCols = [
      "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS business_type VARCHAR(100) NULL",
      "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS owner_name VARCHAR(191) NULL",
      "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL",
      "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) NULL",
      "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS country VARCHAR(100) NULL DEFAULT 'Bangladesh'",
      "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00",
    ];
    for (const sql of alterCols) { await pool.query(sql).catch(() => {}); }
  } catch (err) { console.error('vendor_settings init:', err.message); }
})();

/* ── Settings ── */
router.get('/settings', vendorAuth, async (req, res) => {
  try {
    const vid = req.vendor.id;
    await pool.query('INSERT IGNORE INTO vendor_settings (vendor_id) VALUES (?)', [vid]);
    const [[settings]] = await pool.query('SELECT * FROM vendor_settings WHERE vendor_id=?', [vid]);
    const [quickReplies] = await pool.query('SELECT * FROM vendor_quick_replies WHERE vendor_id=? ORDER BY id DESC', [vid]);
    res.json({ settings, quickReplies });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/settings', vendorAuth, async (req, res) => {
  try {
    const vid = req.vendor.id;
    const { notif_order, notif_product, notif_payment, notif_review, notif_chat,
      auto_reply_enabled, auto_reply_message, business_hours_start, business_hours_end,
      handling_time, default_shipping, invoice_prefix, invoice_start } = req.body;
    await pool.query('INSERT IGNORE INTO vendor_settings (vendor_id) VALUES (?)', [vid]);
    const fields = {}, vals = [];
    const add = (col, val) => { if (val !== undefined) { fields[col] = val; vals.push(val); } };
    add('notif_order', notif_order !== undefined ? (notif_order ? 1 : 0) : undefined);
    add('notif_product', notif_product !== undefined ? (notif_product ? 1 : 0) : undefined);
    add('notif_payment', notif_payment !== undefined ? (notif_payment ? 1 : 0) : undefined);
    add('notif_review', notif_review !== undefined ? (notif_review ? 1 : 0) : undefined);
    add('notif_chat', notif_chat !== undefined ? (notif_chat ? 1 : 0) : undefined);
    add('auto_reply_enabled', auto_reply_enabled !== undefined ? (auto_reply_enabled ? 1 : 0) : undefined);
    add('auto_reply_message', auto_reply_message);
    add('business_hours_start', business_hours_start);
    add('business_hours_end', business_hours_end);
    add('handling_time', handling_time !== undefined ? Number(handling_time) : undefined);
    add('default_shipping', default_shipping);
    add('invoice_prefix', invoice_prefix);
    add('invoice_start', invoice_start !== undefined ? Number(invoice_start) : undefined);
    if (Object.keys(fields).length) {
      const set = Object.keys(fields).map(k => `${k}=?`).join(', ');
      await pool.query(`UPDATE vendor_settings SET ${set} WHERE vendor_id=?`, [...vals, vid]);
    }
    const [[updated]] = await pool.query('SELECT * FROM vendor_settings WHERE vendor_id=?', [vid]);
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Quick Replies ── */
router.get('/quick-replies', vendorAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vendor_quick_replies WHERE vendor_id=? ORDER BY id DESC', [req.vendor.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/quick-replies', vendorAuth, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message required' });
    const [r] = await pool.query('INSERT INTO vendor_quick_replies (vendor_id, title, message) VALUES (?,?,?)', [req.vendor.id, title, message]);
    res.status(201).json({ id: r.insertId, vendor_id: req.vendor.id, title, message, created_at: new Date() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/quick-replies/:id', vendorAuth, async (req, res) => {
  try {
    const [[qr]] = await pool.query('SELECT id FROM vendor_quick_replies WHERE id=? AND vendor_id=?', [req.params.id, req.vendor.id]);
    if (!qr) return res.status(404).json({ message: 'Not found' });
    await pool.query('DELETE FROM vendor_quick_replies WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
