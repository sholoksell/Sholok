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

    // 4. Final fallback: delivery_areas table (per-area admin config, NO free threshold)
    if (!row) {
      let legacyCharge = null;
      let legacySource = null;
      // Try exact area + city match first
      if (area && district) {
        const [lr] = await pool.query(
          `SELECT delivery_charge, name, city FROM delivery_areas
           WHERE LOWER(name) = LOWER(?) AND LOWER(city) = LOWER(?) AND is_active = 1 LIMIT 1`,
          [area, district]
        );
        if (lr.length) { legacyCharge = Number(lr[0].delivery_charge); legacySource = `${lr[0].name}, ${lr[0].city}`; }
      }
      // Try district-only (minimum charge across all areas in that district)
      if (legacyCharge === null && district) {
        const [lr] = await pool.query(
          `SELECT MIN(delivery_charge) AS min_charge FROM delivery_areas
           WHERE LOWER(city) = LOWER(?) AND is_active = 1`,
          [district]
        );
        if (lr.length && lr[0].min_charge !== null) { legacyCharge = Number(lr[0].min_charge); legacySource = district; }
      }
      if (legacyCharge !== null) {
        return res.json({
          charge: legacyCharge, base: legacyCharge, additionalPerKg: 0,
          groupName: 'Standard Rate', district, area, matched: true, source: 'area_table',
          weightKg: kg,
        });
      }
      // Truly no config: return unmatched so checkout can warn the user
      return res.json({ charge: null, groupName: null, matched: false });
    }

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
      source: 'rate_group',
      weightKg: kg,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
