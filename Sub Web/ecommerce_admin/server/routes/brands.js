const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function slugify(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function fmt(r) {
  return {
    _id: r.id, name: r.name, nameBn: r.name_bn, slug: r.slug,
    logo: r.logo, banner: r.banner, description: r.description,
    website: r.website, isActive: !!r.is_active, sortOrder: r.sort_order,
    productCount: r.product_count || 0, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// Public: GET /api/brands
router.get('/', async (req, res) => {
  try {
    const { active, limit = 100 } = req.query;
    let sql = `SELECT b.*, COUNT(p.id) as product_count FROM brands b
               LEFT JOIN products p ON p.brand_id = b.id AND p.status='active'
               WHERE 1=1`;
    const params = [];
    if (active === '1') { sql += ' AND b.is_active=1'; }
    sql += ' GROUP BY b.id ORDER BY b.sort_order ASC, b.name ASC LIMIT ?';
    params.push(Number(limit));
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(fmt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Public: GET /api/brands/:slug
router.get('/:slug', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT b.*, COUNT(p.id) as product_count FROM brands b
       LEFT JOIN products p ON p.brand_id=b.id WHERE b.slug=? OR b.id=? GROUP BY b.id`,
      [req.params.slug, req.params.slug]
    );
    if (!row) return res.status(404).json({ message: 'Brand not found' });
    res.json(fmt(row));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: POST /api/brands
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, name_bn, logo, banner, description, website, is_active = 1, sort_order = 0 } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const slug = slugify(name);
    const [r] = await pool.query(
      'INSERT INTO brands (name, name_bn, slug, logo, banner, description, website, is_active, sort_order) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, name_bn || null, slug, logo || null, banner || null, description || null, website || null, is_active, sort_order]
    );
    const [[created]] = await pool.query('SELECT * FROM brands WHERE id=?', [r.insertId]);
    res.status(201).json(fmt(created));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: PUT /api/brands/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, name_bn, logo, banner, description, website, is_active, sort_order } = req.body;
    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name=?'); params.push(name); }
    if (name_bn !== undefined) { updates.push('name_bn=?'); params.push(name_bn); }
    if (logo !== undefined) { updates.push('logo=?'); params.push(logo); }
    if (banner !== undefined) { updates.push('banner=?'); params.push(banner); }
    if (description !== undefined) { updates.push('description=?'); params.push(description); }
    if (website !== undefined) { updates.push('website=?'); params.push(website); }
    if (is_active !== undefined) { updates.push('is_active=?'); params.push(is_active); }
    if (sort_order !== undefined) { updates.push('sort_order=?'); params.push(sort_order); }
    if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });
    params.push(req.params.id);
    await pool.query(`UPDATE brands SET ${updates.join(',')} WHERE id=?`, params);
    const [[updated]] = await pool.query('SELECT * FROM brands WHERE id=?', [req.params.id]);
    res.json(fmt(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: DELETE /api/brands/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM brands WHERE id=?', [req.params.id]);
    res.json({ message: 'Brand deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
