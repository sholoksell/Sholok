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
        weight_slabs TEXT,
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_area_overrides (
        area_key    VARCHAR(600) PRIMARY KEY,
        division    VARCHAR(100),
        district    VARCHAR(100),
        area        VARCHAR(200),
        status      ENUM('Enable','Disable') NOT NULL DEFAULT 'Enable',
        is_custom   TINYINT(1) NOT NULL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_zone_rate_overrides (
        assignment_key    VARCHAR(600) PRIMARY KEY,
        base_rate         DECIMAL(10,2) NOT NULL,
        additional_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
        weight_slabs      TEXT,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    // Migrations — add missing columns to existing tables
    const migrations = [
      `ALTER TABLE delivery_rate_groups ADD COLUMN weight_slabs TEXT AFTER additional_per_kg`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN division VARCHAR(100) AFTER area_key`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN district VARCHAR(100) AFTER division`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN area VARCHAR(200) AFTER district`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN is_custom TINYINT(1) NOT NULL DEFAULT 0 AFTER status`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    ];
    for (const sql of migrations) {
      try { await pool.query(sql); } catch (e) { /* column already exists — ignore */ }
    }
  } catch (e) {
    console.error('deliveryRates table init:', e.message);
  }
})();

// ── Rate Groups ───────────────────────────────────────────────────────────────

router.get('/rate-groups', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, store_location, name, base_rate, additional_per_kg, weight_slabs FROM delivery_rate_groups ORDER BY store_location, name'
    );
    res.json(rows.map(r => ({
      id: r.id, store: r.store_location, name: r.name,
      base: Number(r.base_rate), additional: Number(r.additional_per_kg),
      weightSlabs: r.weight_slabs || undefined,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/rate-groups/sync', auth, async (req, res) => {
  const groups = req.body;
  if (!Array.isArray(groups)) return res.status(400).json({ message: 'Array expected' });
  try {
    await pool.query('DELETE FROM delivery_rate_groups');
    if (groups.length) {
      const vals = groups.map(g => [g.id, g.store, g.name, Number(g.base), Number(g.additional), g.weightSlabs || null]);
      await pool.query(
        'INSERT INTO delivery_rate_groups (id, store_location, name, base_rate, additional_per_kg, weight_slabs) VALUES ?',
        [vals]
      );
    }
    res.json({ ok: true, count: groups.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Assignments ───────────────────────────────────────────────────────────────

router.get('/assignments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.assignment_key, a.store_location, a.division, a.district, a.area, a.area_id, a.group_id,
              g.name AS group_name, g.base_rate, g.additional_per_kg, g.weight_slabs AS group_weight_slabs,
              o.base_rate AS override_base, o.additional_per_kg AS override_additional, o.weight_slabs AS override_slabs
       FROM delivery_area_assignments a
       LEFT JOIN delivery_rate_groups g ON g.id = a.group_id
       LEFT JOIN delivery_zone_rate_overrides o ON o.assignment_key = a.assignment_key
       ORDER BY a.division, a.district, a.area`
    );
    res.json(rows.map(r => ({
      key: r.assignment_key, store: r.store_location,
      division: r.division, district: r.district, area: r.area, areaId: r.area_id,
      groupId: r.group_id, groupName: r.group_name,
      base: Number(r.base_rate || 0), additional: Number(r.additional_per_kg || 0),
      weightSlabs: r.group_weight_slabs || undefined,
      baseOverride: r.override_base != null ? Number(r.override_base) : null,
      additionalOverride: r.override_additional != null ? Number(r.override_additional) : null,
      weightSlabsOverride: r.override_slabs || null,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/assignments/sync', auth, async (req, res) => {
  const assignments = req.body;
  if (!Array.isArray(assignments)) return res.status(400).json({ message: 'Array expected' });
  try {
    // Deduplicate by key (last write wins)
    const seen = new Map();
    for (const a of assignments) seen.set(a.key, a);
    const deduped = [...seen.values()];

    await pool.query('DELETE FROM delivery_area_assignments');
    if (deduped.length) {
      const vals = deduped.map(a => [
        a.key, a.store, a.division, a.district, a.area, a.areaId, a.groupId,
      ]);
      await pool.query(
        `INSERT INTO delivery_area_assignments
           (assignment_key, store_location, division, district, area, area_id, group_id)
         VALUES ?`,
        [vals]
      );
    }
    res.json({ ok: true, count: deduped.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Per-zone rate overrides ───────────────────────────────────────────────────

router.put('/assignments/rate-override', auth, async (req, res) => {
  const { key, base, additional, slabs } = req.body;
  if (!key || base == null) return res.status(400).json({ message: 'key and base required' });
  try {
    await pool.query(
      `INSERT INTO delivery_zone_rate_overrides (assignment_key, base_rate, additional_per_kg, weight_slabs)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate), additional_per_kg = VALUES(additional_per_kg), weight_slabs = VALUES(weight_slabs)`,
      [key, Number(base), Number(additional) || 0, slabs || null]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/assignments/rate-override/:key', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM delivery_zone_rate_overrides WHERE assignment_key = ?', [req.params.key]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Area Overrides (Enable/Disable + Custom areas) ────────────────────────────

router.get('/area-overrides', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT area_key, division, district, area, status, is_custom FROM delivery_area_overrides');
    res.json(rows.map(r => ({
      key: r.area_key, division: r.division, district: r.district, area: r.area,
      status: r.status, isCustom: !!r.is_custom,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/area-statuses/sync', auth, async (req, res) => {
  const statusMap = req.body; // { [key]: 'Enable' | 'Disable' }
  if (typeof statusMap !== 'object') return res.status(400).json({ message: 'Object expected' });
  try {
    // Only upsert entries that are explicitly Disabled (Enable is default; skip to keep table small)
    const disabledKeys = Object.entries(statusMap).filter(([, v]) => v === 'Disable');
    // Remove all non-custom status rows first
    await pool.query(`DELETE FROM delivery_area_overrides WHERE is_custom = 0`);
    if (disabledKeys.length) {
      const vals = disabledKeys.map(([k]) => [k, 'Disable', 0]);
      await pool.query(
        `INSERT INTO delivery_area_overrides (area_key, status, is_custom) VALUES ?
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [vals]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/area-overrides/custom', auth, async (req, res) => {
  const { key, division, district, area } = req.body;
  if (!key || !area) return res.status(400).json({ message: 'key and area required' });
  try {
    await pool.query(
      `INSERT INTO delivery_area_overrides (area_key, division, district, area, status, is_custom)
       VALUES (?, ?, ?, ?, 'Enable', 1)
       ON DUPLICATE KEY UPDATE division = VALUES(division), district = VALUES(district), area = VALUES(area)`,
      [key, division, district, area]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/area-overrides/custom/:key', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM delivery_area_overrides WHERE area_key = ? AND is_custom = 1', [req.params.key]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── District Rename ───────────────────────────────────────────────────────────

router.post('/district-rename', auth, async (req, res) => {
  const { division, oldDistrict, newDistrict } = req.body;
  if (!oldDistrict || !newDistrict) return res.status(400).json({ message: 'oldDistrict and newDistrict required' });
  try {
    await pool.query(
      `UPDATE delivery_area_overrides SET district = ? WHERE division = ? AND district = ? AND is_custom = 1`,
      [newDistrict, division, oldDistrict]
    );
    await pool.query(
      `UPDATE delivery_area_assignments SET district = ? WHERE division = ? AND district = ?`,
      [newDistrict, division, oldDistrict]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Charge Lookup ─────────────────────────────────────────────────────────────

router.get('/charge', async (req, res) => {
  const { district, area, weight = 1 } = req.query;
  const kg = Math.max(1, parseFloat(weight) || 1);
  try {
    let row;
    if (area) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name,
                a.district, a.division, a.area,
                o.base_rate AS override_base, o.additional_per_kg AS override_additional, o.weight_slabs AS override_slabs
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         LEFT JOIN delivery_zone_rate_overrides o ON o.assignment_key = a.assignment_key
         WHERE a.area = ? AND a.district = ?
         LIMIT 1`,
        [area, district || '']
      );
      if (rows.length) row = rows[0];
    }
    if (!row && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name,
                a.district, a.division, a.area,
                o.base_rate AS override_base, o.additional_per_kg AS override_additional, o.weight_slabs AS override_slabs
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         LEFT JOIN delivery_zone_rate_overrides o ON o.assignment_key = a.assignment_key
         WHERE a.district = ?
         LIMIT 1`,
        [district]
      );
      if (rows.length) row = rows[0];
    }
    if (!row) return res.json({ charge: 0, groupName: null, matched: false });

    const base  = row.override_base != null ? Number(row.override_base) : Number(row.base_rate);
    const extra = row.override_additional != null ? Number(row.override_additional) : Number(row.additional_per_kg);
    const slabs = row.override_slabs || row.weight_slabs;

    let charge;
    if (slabs) {
      const parsed = slabs.split(',').map(s => { const [m, p] = s.trim().split(':'); return { maxKg: parseFloat(m), price: parseFloat(p) }; }).filter(s => !isNaN(s.maxKg) && !isNaN(s.price));
      const slab = parsed.find(s => kg <= s.maxKg);
      charge = slab ? slab.price : base + extra * Math.max(0, kg - 1);
    } else {
      charge = kg <= 1 ? base : base + Math.ceil(kg - 1) * extra;
    }

    res.json({
      charge, base, additionalPerKg: extra,
      groupName: row.group_name,
      district: row.district, division: row.division, area: row.area,
      matched: true,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
