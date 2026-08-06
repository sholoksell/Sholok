const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function fmt(r) {
  return { _id: r.id, name: r.name, code: r.code, logo: r.logo, isActive: !!r.is_active, trackingUrlTemplate: r.tracking_url_template, createdAt: r.created_at };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM couriers ORDER BY name ASC');
    res.json(rows.map(fmt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, code, logo, tracking_url_template } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const [r] = await pool.query('INSERT INTO couriers (name, code, logo, tracking_url_template) VALUES (?,?,?,?)', [name, code || null, logo || null, tracking_url_template || null]);
    const [[created]] = await pool.query('SELECT * FROM couriers WHERE id=?', [r.insertId]);
    res.status(201).json(fmt(created));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, code, logo, tracking_url_template, is_active } = req.body;
    await pool.query(
      'UPDATE couriers SET name=COALESCE(?,name), code=COALESCE(?,code), logo=COALESCE(?,logo), tracking_url_template=COALESCE(?,tracking_url_template), is_active=COALESCE(?,is_active) WHERE id=?',
      [name, code, logo, tracking_url_template, is_active != null ? is_active : null, req.params.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM couriers WHERE id=?', [req.params.id]);
    res.json(fmt(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM couriers WHERE id=?', [req.params.id]);
    res.json({ message: 'Courier deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
