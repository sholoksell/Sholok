const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function fmt(r) {
  return {
    _id: r.id, name: r.name, code: r.code, address: r.address,
    division: r.division, district: r.district, upazila: r.upazila, city: r.city,
    isActive: !!r.is_active, isDefault: !!r.is_default,
    contactName: r.contact_name, contactPhone: r.contact_phone,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM warehouses ORDER BY is_default DESC, name ASC');
    res.json(rows.map(fmt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM warehouses WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(fmt(row));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, code, address, division, district, upazila, city, contact_name, contact_phone, is_default } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    if (is_default) await pool.query('UPDATE warehouses SET is_default=0');
    const [r] = await pool.query(
      'INSERT INTO warehouses (name,code,address,division,district,upazila,city,contact_name,contact_phone,is_default) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [name, code || null, address || null, division || null, district || null, upazila || null, city || null, contact_name || null, contact_phone || null, is_default ? 1 : 0]
    );
    const [[created]] = await pool.query('SELECT * FROM warehouses WHERE id=?', [r.insertId]);
    res.status(201).json(fmt(created));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, code, address, division, district, upazila, city, contact_name, contact_phone, is_active, is_default } = req.body;
    if (is_default) await pool.query('UPDATE warehouses SET is_default=0');
    await pool.query(
      `UPDATE warehouses SET name=COALESCE(?,name), code=COALESCE(?,code), address=COALESCE(?,address),
       division=COALESCE(?,division), district=COALESCE(?,district), upazila=COALESCE(?,upazila), city=COALESCE(?,city),
       contact_name=COALESCE(?,contact_name), contact_phone=COALESCE(?,contact_phone),
       is_active=COALESCE(?,is_active), is_default=COALESCE(?,is_default) WHERE id=?`,
      [name, code, address, division, district, upazila, city, contact_name, contact_phone, is_active != null ? is_active : null, is_default != null ? is_default : null, req.params.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM warehouses WHERE id=?', [req.params.id]);
    res.json(fmt(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE warehouses SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'Warehouse deactivated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
