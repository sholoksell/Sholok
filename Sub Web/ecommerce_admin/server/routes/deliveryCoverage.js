const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

/* ── Grocery coverage ── */

router.get('/grocery/districts', async (req, res) => {
  try {
    const [districts] = await pool.query('SELECT * FROM grocery_delivery_districts WHERE is_active=1 ORDER BY sort_order ASC, name ASC');
    const [areas] = await pool.query('SELECT * FROM grocery_delivery_areas ORDER BY sort_order ASC, name ASC');
    const result = districts.map(d => ({
      _id: d.id, name: d.name, nameBn: d.name_bn, isActive: !!d.is_active,
      areas: areas.filter(a => a.district_id === d.id).map(a => ({
        _id: a.id, name: a.name, nameBn: a.name_bn, isActive: !!a.is_active, sortOrder: a.sort_order
      }))
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/grocery/districts', authMiddleware, async (req, res) => {
  try {
    const { name, name_bn } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const [r] = await pool.query('INSERT INTO grocery_delivery_districts (name, name_bn) VALUES (?,?)', [name, name_bn || null]);
    res.status(201).json({ _id: r.insertId, name, nameBn: name_bn });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/grocery/areas', authMiddleware, async (req, res) => {
  try {
    const { district_id, name, name_bn, sort_order } = req.body;
    if (!district_id || !name) return res.status(400).json({ message: 'district_id and name required' });
    const [r] = await pool.query('INSERT INTO grocery_delivery_areas (district_id, name, name_bn, sort_order) VALUES (?,?,?,?)', [district_id, name, name_bn || null, sort_order || 0]);
    res.status(201).json({ _id: r.insertId, districtId: district_id, name, nameBn: name_bn });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/grocery/areas/:id', authMiddleware, async (req, res) => {
  try {
    const { name, name_bn, is_active, sort_order } = req.body;
    await pool.query('UPDATE grocery_delivery_areas SET name=COALESCE(?,name), name_bn=COALESCE(?,name_bn), is_active=COALESCE(?,is_active), sort_order=COALESCE(?,sort_order) WHERE id=?',
      [name, name_bn, is_active != null ? is_active : null, sort_order != null ? sort_order : null, req.params.id]);
    const [[row]] = await pool.query('SELECT * FROM grocery_delivery_areas WHERE id=?', [req.params.id]);
    res.json({ _id: row.id, name: row.name, nameBn: row.name_bn, isActive: !!row.is_active });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/delivery-coverage/grocery/check — check if an area is covered
router.post('/grocery/check', async (req, res) => {
  try {
    const { area_name, district_id } = req.body;
    let covered = false;
    if (district_id) {
      const [[row]] = await pool.query('SELECT id FROM grocery_delivery_areas WHERE district_id=? AND is_active=1 AND name=?', [district_id, area_name]);
      covered = !!row;
    } else if (area_name) {
      const [[row]] = await pool.query('SELECT gda.id FROM grocery_delivery_areas gda JOIN grocery_delivery_districts gdd ON gdd.id=gda.district_id WHERE gda.name=? AND gda.is_active=1 AND gdd.is_active=1', [area_name]);
      covered = !!row;
    }
    res.json({ covered });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Nationwide (divisions/districts/upazilas) ── */

router.get('/nationwide/divisions', async (req, res) => {
  try {
    const [divisions] = await pool.query('SELECT * FROM delivery_divisions WHERE is_active=1 ORDER BY name ASC');
    res.json(divisions.map(d => ({ _id: d.id, name: d.name, nameBn: d.name_bn })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/nationwide/districts', async (req, res) => {
  try {
    const { division_id } = req.query;
    let sql = 'SELECT * FROM delivery_districts WHERE is_active=1';
    const params = [];
    if (division_id) { sql += ' AND division_id=?'; params.push(division_id); }
    sql += ' ORDER BY name ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(d => ({ _id: d.id, divisionId: d.division_id, name: d.name, nameBn: d.name_bn })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/nationwide/upazilas', async (req, res) => {
  try {
    const { district_id } = req.query;
    let sql = 'SELECT * FROM delivery_upazilas WHERE is_active=1';
    const params = [];
    if (district_id) { sql += ' AND district_id=?'; params.push(district_id); }
    sql += ' ORDER BY name ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(u => ({ _id: u.id, districtId: u.district_id, name: u.name, nameBn: u.name_bn })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Shipping policies ── */

router.get('/shipping-policies', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shipping_policies ORDER BY source_type, is_inside_city DESC');
    res.json(rows.map(r => ({
      _id: r.id, sourceType: r.source_type, sourceId: r.source_id,
      divisionId: r.division_id, districtId: r.district_id, areaName: r.area_name,
      isInsideCity: !!r.is_inside_city, baseWeightKg: Number(r.base_weight_kg),
      baseCharge: Number(r.base_charge), extraChargePerKg: Number(r.extra_charge_per_kg),
      estimatedDaysMin: r.estimated_days_min, estimatedDaysMax: r.estimated_days_max,
      freeDeliveryThreshold: r.free_delivery_threshold ? Number(r.free_delivery_threshold) : null,
      isActive: !!r.is_active, createdAt: r.created_at
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/shipping-policies', authMiddleware, async (req, res) => {
  try {
    const { source_type = 'sholok', source_id, division_id, district_id, area_name, is_inside_city, base_weight_kg = 1, base_charge, extra_charge_per_kg, estimated_days_min, estimated_days_max, free_delivery_threshold } = req.body;
    const [r] = await pool.query(
      `INSERT INTO shipping_policies (source_type,source_id,division_id,district_id,area_name,is_inside_city,base_weight_kg,base_charge,extra_charge_per_kg,estimated_days_min,estimated_days_max,free_delivery_threshold) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [source_type, source_id || null, division_id || null, district_id || null, area_name || null, is_inside_city ? 1 : 0, base_weight_kg, base_charge, extra_charge_per_kg, estimated_days_min || 1, estimated_days_max || 3, free_delivery_threshold || null]
    );
    res.status(201).json({ _id: r.insertId });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/shipping-policies/:id', authMiddleware, async (req, res) => {
  try {
    const { base_charge, extra_charge_per_kg, estimated_days_min, estimated_days_max, free_delivery_threshold, is_active } = req.body;
    await pool.query(
      'UPDATE shipping_policies SET base_charge=COALESCE(?,base_charge), extra_charge_per_kg=COALESCE(?,extra_charge_per_kg), estimated_days_min=COALESCE(?,estimated_days_min), estimated_days_max=COALESCE(?,estimated_days_max), free_delivery_threshold=COALESCE(?,free_delivery_threshold), is_active=COALESCE(?,is_active) WHERE id=?',
      [base_charge, extra_charge_per_kg, estimated_days_min, estimated_days_max, free_delivery_threshold, is_active != null ? is_active : null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Delivery charge calculator ── */

router.post('/calculate-charge', async (req, res) => {
  try {
    const { district_id, weight_kg = 0.5, order_total = 0, is_grocery } = req.body;
    if (is_grocery) {
      return res.json({ charge: 60, currency: 'BDT', estimatedDaysMin: 0, estimatedDaysMax: 0, deliveryType: 'grocery' });
    }
    let policy = null;
    if (district_id) {
      const [[row]] = await pool.query('SELECT * FROM shipping_policies WHERE district_id=? AND source_type=\'sholok\' AND is_active=1 LIMIT 1', [district_id]);
      policy = row;
    }
    if (!policy) {
      const [[row]] = await pool.query('SELECT * FROM shipping_policies WHERE source_type=\'sholok\' AND district_id IS NULL AND is_active=1 LIMIT 1');
      policy = row;
    }
    if (!policy) return res.json({ charge: 150, currency: 'BDT', estimatedDaysMin: 3, estimatedDaysMax: 7, deliveryType: 'nationwide' });

    if (policy.free_delivery_threshold && order_total >= policy.free_delivery_threshold) {
      return res.json({ charge: 0, currency: 'BDT', estimatedDaysMin: policy.estimated_days_min, estimatedDaysMax: policy.estimated_days_max, deliveryType: 'free' });
    }
    const extraWeight = Math.max(0, Number(weight_kg) - Number(policy.base_weight_kg));
    const charge = Number(policy.base_charge) + extraWeight * Number(policy.extra_charge_per_kg);
    res.json({ charge: Math.ceil(charge), currency: 'BDT', estimatedDaysMin: policy.estimated_days_min, estimatedDaysMax: policy.estimated_days_max, deliveryType: !!policy.is_inside_city ? 'inside_city' : 'nationwide' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
