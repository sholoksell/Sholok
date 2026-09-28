const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/delivery-rates/rate-groups  (public)
router.get('/rate-groups', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, store_location, name, base_rate, additional_per_kg FROM delivery_rate_groups ORDER BY store_location, name'
    );
    res.json(rows.map(r => ({
      id: r.id, store: r.store_location, name: r.name,
      base: Number(r.base_rate), additional: Number(r.additional_per_kg),
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/delivery-rates/charge?district=X&area=Y&weight=N  (public)
router.get('/charge', async (req, res) => {
  const { district, area, weight = 0.5 } = req.query;
  const kg = Math.max(0.5, parseFloat(weight) || 0.5);
  try {
    let row;
    // 1. Exact area + district match
    if (area && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE LOWER(a.area) = LOWER(?) AND LOWER(a.district) = LOWER(?)
         LIMIT 1`,
        [area, district]
      );
      if (rows.length) row = rows[0];
    }
    // 2. Fallback: district only
    if (!row && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE LOWER(a.district) = LOWER(?)
         LIMIT 1`,
        [district]
      );
      if (rows.length) row = rows[0];
    }
    // 3. Fallback: division-level match using area name as division
    if (!row && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE LOWER(a.division) = LOWER(?)
         LIMIT 1`,
        [district]
      );
      if (rows.length) row = rows[0];
    }

    if (!row) return res.json({ charge: 0, groupName: null, matched: false });

    const base  = Number(row.base_rate);
    const extra = Number(row.additional_per_kg);
    // First 0.5 kg = base rate; each additional 0.5 kg or fraction = extra charge
    const extraKg = Math.max(0, kg - 0.5);
    const charge  = extra > 0 && extraKg > 0
      ? base + Math.ceil(extraKg / 0.5) * extra
      : base;

    res.json({
      charge,
      base,
      additionalPerKg: extra,
      groupName: row.group_name,
      district: row.district,
      division: row.division,
      area: row.area,
      matched: true,
      weightKg: kg,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
