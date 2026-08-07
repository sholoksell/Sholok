const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

/* ── Delivery Slots ── */

router.get('/slots', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM grocery_delivery_slots ORDER BY sort_order ASC');
    res.json(rows.map(r => ({
      _id: r.id, label: r.label, startTime: r.start_time, endTime: r.end_time,
      maxOrders: r.max_orders, isActive: !!r.is_active, sortOrder: r.sort_order
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/slots', authMiddleware, async (req, res) => {
  try {
    const { label, start_time, end_time, max_orders, sort_order } = req.body;
    if (!label || !start_time || !end_time) return res.status(400).json({ message: 'label, start_time, end_time required' });
    const [r] = await pool.query('INSERT INTO grocery_delivery_slots (label, start_time, end_time, max_orders, sort_order) VALUES (?,?,?,?,?)',
      [label, start_time, end_time, max_orders || null, sort_order || 0]);
    const [[created]] = await pool.query('SELECT * FROM grocery_delivery_slots WHERE id=?', [r.insertId]);
    res.status(201).json({ _id: created.id, label: created.label, startTime: created.start_time, endTime: created.end_time });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/slots/:id', authMiddleware, async (req, res) => {
  try {
    const { label, start_time, end_time, max_orders, is_active, sort_order } = req.body;
    await pool.query('UPDATE grocery_delivery_slots SET label=COALESCE(?,label), start_time=COALESCE(?,start_time), end_time=COALESCE(?,end_time), max_orders=COALESCE(?,max_orders), is_active=COALESCE(?,is_active), sort_order=COALESCE(?,sort_order) WHERE id=?',
      [label, start_time, end_time, max_orders, is_active != null ? is_active : null, sort_order != null ? sort_order : null, req.params.id]);
    const [[row]] = await pool.query('SELECT * FROM grocery_delivery_slots WHERE id=?', [req.params.id]);
    res.json({ _id: row.id, label: row.label, startTime: row.start_time, endTime: row.end_time, isActive: !!row.is_active });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/slots/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM grocery_delivery_slots WHERE id=?', [req.params.id]);
    res.json({ message: 'Slot deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── General Settings (grocery keys) ── */

router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM settings WHERE group_name IN ('grocery','shipping')");
    const result = {};
    rows.forEach(r => { result[r.setting_key] = r.value; });
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await pool.query('UPDATE settings SET value=? WHERE setting_key=?', [String(value), key]);
    }
    res.json({ message: 'Settings updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
