const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// ── auto-create tables ─────────────────────────────────────────────────────
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promotion_campaigns (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        type ENUM('summer_fest','buy_save','great_deals','seasonal','festival','special_event') NOT NULL DEFAULT 'seasonal',
        description TEXT,
        image VARCHAR(500),
        discount_type ENUM('none','percentage','fixed') DEFAULT 'none',
        discount_value DECIMAL(10,2) DEFAULT 0,
        min_purchase DECIMAL(10,2) DEFAULT 0,
        max_discount DECIMAL(10,2) DEFAULT 0,
        max_quantity INT DEFAULT 0,
        per_customer_limit INT DEFAULT 0,
        coupon_code VARCHAR(50),
        tiers JSON,
        start_date DATETIME,
        end_date DATETIME,
        status ENUM('draft','scheduled','active','paused','expired') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaign_products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        product_id INT,
        category_id INT,
        brand_id INT,
        FOREIGN KEY (campaign_id) REFERENCES promotion_campaigns(id) ON DELETE CASCADE,
        UNIQUE KEY uq_cp (campaign_id, product_id)
      )
    `);
  } catch (e) {
    console.error('campaigns table init:', e.message);
  }
})();

function fmt(r) {
  return {
    id: r.id, name: r.name, type: r.type, description: r.description,
    image: r.image, discountType: r.discount_type,
    discountValue: Number(r.discount_value || 0),
    minPurchase: Number(r.min_purchase || 0), maxDiscount: Number(r.max_discount || 0),
    maxQuantity: r.max_quantity || 0, perCustomerLimit: r.per_customer_limit || 0,
    couponCode: r.coupon_code,
    tiers: r.tiers ? (typeof r.tiers === 'string' ? JSON.parse(r.tiers) : r.tiers) : [],
    startDate: r.start_date, endDate: r.end_date, status: r.status, createdAt: r.created_at,
  };
}

function computeStatus(row) {
  const now = new Date();
  if (row.status === 'paused' || row.status === 'draft') return row.status;
  if (row.end_date && new Date(row.end_date) < now) return 'expired';
  if (row.start_date && new Date(row.start_date) > now) return 'scheduled';
  if (row.status === 'active') return 'active';
  return row.status;
}

// ── PUBLIC ─────────────────────────────────────────────────────────────────

// GET /api/campaigns/active?type=summer_fest
router.get('/active', async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();
    let sql = `SELECT * FROM promotion_campaigns
               WHERE status = 'active'
                 AND (start_date IS NULL OR start_date <= ?)
                 AND (end_date IS NULL OR end_date >= ?)`;
    const params = [now, now];
    if (type) { sql += ' AND type = ?'; params.push(type); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(fmt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/campaigns/:id/products — public (no auth)
router.get('/:id/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price,
              p.stock, p.on_sale, c.name as category_name
       FROM campaign_products cp
       JOIN products p ON p.id = cp.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE cp.campaign_id = ? AND p.status = 'active' AND p.stock > 0
       ORDER BY p.name ASC LIMIT 100`,
      [req.params.id]
    );
    // Also load products by category/brand if no direct product assignments
    if (rows.length === 0) {
      const [[camp]] = await pool.query('SELECT * FROM promotion_campaigns WHERE id=?', [req.params.id]);
      if (!camp) return res.json({ products: [] });
      const [cats] = await pool.query('SELECT DISTINCT category_id FROM campaign_products WHERE campaign_id=? AND category_id IS NOT NULL', [req.params.id]);
      const [brands] = await pool.query('SELECT DISTINCT brand_id FROM campaign_products WHERE campaign_id=? AND brand_id IS NOT NULL', [req.params.id]);
      if (cats.length || brands.length) {
        const catIds = cats.map(r => r.category_id).filter(Boolean);
        const brandIds = brands.map(r => r.brand_id).filter(Boolean);
        let where = "p.status='active' AND p.stock>0";
        const p2 = [];
        const conds = [];
        if (catIds.length) { conds.push(`p.category_id IN (${catIds.join(',')})`); }
        if (brandIds.length) { conds.push(`p.brand_id IN (${brandIds.join(',')})`); }
        if (conds.length) where += ' AND (' + conds.join(' OR ') + ')';
        const [r2] = await pool.query(`SELECT p.id,p.name,p.slug,p.thumbnail,p.regular_price,p.sale_price,p.stock,p.on_sale FROM products p WHERE ${where} LIMIT 100`, p2);
        return res.json({ products: r2 });
      }
    }
    res.json({ products: rows });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── ADMIN ──────────────────────────────────────────────────────────────────

// GET /api/campaigns
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM promotion_campaigns';
    const params = [];
    if (type) { sql += ' WHERE type = ?'; params.push(type); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    const formatted = rows.map(r => ({ ...fmt(r), status: computeStatus(r) }));
    res.json(formatted);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/campaigns/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM promotion_campaigns WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ ...fmt(row), status: computeStatus(row) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/campaigns
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, type = 'seasonal', description, image,
      discountType = 'none', discountValue = 0,
      minPurchase = 0, maxDiscount = 0, maxQuantity = 0, perCustomerLimit = 0,
      couponCode, tiers, startDate, endDate, status = 'draft',
    } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const [r] = await pool.query(
      `INSERT INTO promotion_campaigns
       (name,type,description,image,discount_type,discount_value,min_purchase,max_discount,max_quantity,per_customer_limit,coupon_code,tiers,start_date,end_date,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, type, description || null, image || null, discountType, discountValue,
       minPurchase, maxDiscount, maxQuantity, perCustomerLimit,
       couponCode || null, tiers ? JSON.stringify(tiers) : null,
       startDate || null, endDate || null, status]
    );
    const [[saved]] = await pool.query('SELECT * FROM promotion_campaigns WHERE id=?', [r.insertId]);
    res.status(201).json(fmt(saved));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/campaigns/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const fields = {};
    const map = {
      name:'name', type:'type', description:'description', image:'image',
      discountType:'discount_type', discountValue:'discount_value',
      minPurchase:'min_purchase', maxDiscount:'max_discount',
      maxQuantity:'max_quantity', perCustomerLimit:'per_customer_limit',
      couponCode:'coupon_code', startDate:'start_date', endDate:'end_date', status:'status',
    };
    for (const [k, col] of Object.entries(map)) {
      if (req.body[k] !== undefined) fields[col] = req.body[k] === '' ? null : req.body[k];
    }
    if (req.body.tiers !== undefined) fields.tiers = JSON.stringify(req.body.tiers);
    if (!Object.keys(fields).length) return res.status(400).json({ message: 'Nothing to update' });
    const setClauses = Object.keys(fields).map(k => `${k}=?`).join(',');
    await pool.query(`UPDATE promotion_campaigns SET ${setClauses} WHERE id=?`, [...Object.values(fields), req.params.id]);
    const [[saved]] = await pool.query('SELECT * FROM promotion_campaigns WHERE id=?', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Not found' });
    res.json({ ...fmt(saved), status: computeStatus(saved) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/campaigns/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM promotion_campaigns WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await pool.query('DELETE FROM promotion_campaigns WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/campaigns/:id/products — assign products/categories/brands
router.post('/:id/products', authMiddleware, async (req, res) => {
  try {
    const { productIds = [], categoryIds = [], brandIds = [] } = req.body;
    const cid = req.params.id;
    await pool.query('DELETE FROM campaign_products WHERE campaign_id=?', [cid]);
    const values = [];
    productIds.forEach(pid => values.push([cid, pid, null, null]));
    categoryIds.forEach(cid2 => values.push([cid, null, cid2, null]));
    brandIds.forEach(bid => values.push([cid, null, null, bid]));
    if (values.length) {
      await pool.query('INSERT IGNORE INTO campaign_products (campaign_id,product_id,category_id,brand_id) VALUES ?', [values]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
