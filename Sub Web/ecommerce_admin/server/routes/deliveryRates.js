const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// ── Auto-create tables ────────────────────────────────────────────────────────
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_rate_groups (
        id           VARCHAR(60)   PRIMARY KEY,
        store_location VARCHAR(100) NOT NULL,
        name         VARCHAR(200)  NOT NULL,
        base_rate    DECIMAL(10,2) NOT NULL DEFAULT 0,
        additional_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_store_name (store_location, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_area_assignments (
        assignment_key VARCHAR(600) PRIMARY KEY,
        store_location VARCHAR(100) NOT NULL,
        division       VARCHAR(100),
        district       VARCHAR(100),
        area           VARCHAR(200),
        area_id        VARCHAR(600),
        group_id       VARCHAR(60),
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_district (district),
        KEY idx_division (division)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.error('deliveryRates table init:', e.message);
  }
})();

// ── Rate Groups ───────────────────────────────────────────────────────────────

// GET all rate groups (public — needed for shopping checkout)
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

// POST bulk sync (replaces all) — admin only
router.post('/rate-groups/sync', auth, async (req, res) => {
  const groups = req.body; // array of { id, store, name, base, additional }
  if (!Array.isArray(groups)) return res.status(400).json({ message: 'Array expected' });
  try {
    await pool.query('DELETE FROM delivery_rate_groups');
    if (groups.length) {
      const vals = groups.map(g => [g.id, g.store, g.name, Number(g.base), Number(g.additional)]);
      await pool.query(
        'INSERT INTO delivery_rate_groups (id, store_location, name, base_rate, additional_per_kg) VALUES ?',
        [vals]
      );
    }
    res.json({ ok: true, count: groups.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Assignments ───────────────────────────────────────────────────────────────

// GET all assignments (public — needed for shopping checkout)
router.get('/assignments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.assignment_key, a.store_location, a.division, a.district, a.area, a.area_id, a.group_id,
              g.name AS group_name, g.base_rate, g.additional_per_kg
       FROM delivery_area_assignments a
       LEFT JOIN delivery_rate_groups g ON g.id = a.group_id
       ORDER BY a.division, a.district, a.area`
    );
    res.json(rows.map(r => ({
      key: r.assignment_key, store: r.store_location,
      division: r.division, district: r.district, area: r.area, areaId: r.area_id,
      groupId: r.group_id, groupName: r.group_name,
      base: Number(r.base_rate || 0), additional: Number(r.additional_per_kg || 0),
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST bulk sync — admin only
router.post('/assignments/sync', auth, async (req, res) => {
  const assignments = req.body;
  if (!Array.isArray(assignments)) return res.status(400).json({ message: 'Array expected' });
  try {
    await pool.query('DELETE FROM delivery_area_assignments');
    if (assignments.length) {
      const vals = assignments.map(a => [
        a.key, a.store, a.division, a.district, a.area, a.areaId, a.groupId,
      ]);
      await pool.query(
        `INSERT INTO delivery_area_assignments
           (assignment_key, store_location, division, district, area, area_id, group_id)
         VALUES ?`,
        [vals]
      );
    }
    res.json({ ok: true, count: assignments.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Charge Lookup ─────────────────────────────────────────────────────────────
// GET /api/delivery-rates/charge?district=Dhaka&area=Mirpur&weight=2
// Returns the calculated delivery charge for the given area
router.get('/charge', async (req, res) => {
  const { district, area, weight = 1 } = req.query;
  const kg = Math.max(1, parseFloat(weight) || 1);
  try {
    let row;
    // 1. Try exact area+district match
    if (area) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE a.area = ? AND a.district = ?
         LIMIT 1`,
        [area, district || '']
      );
      if (rows.length) row = rows[0];
    }
    // 2. Fallback: match by district only
    if (!row && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE a.district = ?
         LIMIT 1`,
        [district]
      );
      if (rows.length) row = rows[0];
    }
    if (!row) return res.json({ charge: 0, groupName: null, matched: false });

    const base = Number(row.base_rate);
    const extra = Number(row.additional_per_kg);
    const charge = kg <= 1 ? base : base + Math.ceil(kg - 1) * extra;
    res.json({
      charge,
      base,
      additionalPerKg: extra,
      groupName: row.group_name,
      district: row.district,
      division: row.division,
      area: row.area,
      matched: true,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
