const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// ── Auto-create / migrate tables ─────────────────────────────────────────────
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_rate_groups (
        id               VARCHAR(60)   PRIMARY KEY,
        store_location   VARCHAR(100)  NOT NULL,
        name             VARCHAR(200)  NOT NULL,
        base_rate        DECIMAL(10,2) NOT NULL DEFAULT 0,
        additional_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
        weight_slabs     TEXT,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_store_name (store_location, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    // Migrate: add weight_slabs column if missing
    await pool.query(`
      ALTER TABLE delivery_rate_groups ADD COLUMN IF NOT EXISTS weight_slabs TEXT
    `).catch(() => {});

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

    // Stores per-area status overrides and custom (non-standard) areas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_area_overrides (
        area_key   VARCHAR(600) PRIMARY KEY,
        division   VARCHAR(100) NOT NULL DEFAULT '',
        district   VARCHAR(100) NOT NULL DEFAULT '',
        area_name  VARCHAR(200) NOT NULL DEFAULT '',
        status     ENUM('Enable','Disable') NOT NULL DEFAULT 'Enable',
        is_custom  TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.error('deliveryRates table init:', e.message);
  }
})();

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Parse slab string "1:60, 2:80, 3:100, 5:140, 10:240"
 * Returns sorted array of { maxKg, price }
 */
function parseSlabs(slabStr) {
  if (!slabStr) return [];
  return slabStr.split(',').map(s => {
    const [k, p] = s.trim().split(':');
    return { maxKg: parseFloat(k), price: parseFloat(p) };
  }).filter(s => !isNaN(s.maxKg) && !isNaN(s.price))
    .sort((a, b) => a.maxKg - b.maxKg);
}

function calcCharge(baseRate, additionalPerKg, weightSlabs, kg) {
  const slabs = parseSlabs(weightSlabs);
  if (slabs.length) {
    // Find the slab that covers this weight
    for (const slab of slabs) {
      if (kg <= slab.maxKg) return slab.price;
    }
    // Weight exceeds all slabs — use last slab + additional per kg
    const last = slabs[slabs.length - 1];
    return last.price + Math.ceil(kg - last.maxKg) * additionalPerKg;
  }
  // No slabs: base + extra per kg after first
  return kg <= 1 ? baseRate : baseRate + Math.ceil(kg - 1) * additionalPerKg;
}

// ── Rate Groups ───────────────────────────────────────────────────────────────
router.get('/rate-groups', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, store_location, name, base_rate, additional_per_kg, weight_slabs FROM delivery_rate_groups ORDER BY store_location, name'
    );
    res.json(rows.map(r => ({
      id: r.id, store: r.store_location, name: r.name,
      base: Number(r.base_rate), additional: Number(r.additional_per_kg),
      weightSlabs: r.weight_slabs || '',
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/rate-groups/sync', auth, async (req, res) => {
  const groups = req.body;
  if (!Array.isArray(groups)) return res.status(400).json({ message: 'Array expected' });
  try {
    await pool.query('DELETE FROM delivery_rate_groups');
    if (groups.length) {
      const vals = groups.map(g => [
        g.id, g.store || 'main', g.name,
        Number(g.base), Number(g.additional),
        g.weightSlabs || null,
      ]);
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
              g.name AS group_name, g.base_rate, g.additional_per_kg, g.weight_slabs
       FROM delivery_area_assignments a
       LEFT JOIN delivery_rate_groups g ON g.id = a.group_id
       ORDER BY a.division, a.district, a.area`
    );
    res.json(rows.map(r => ({
      key: r.assignment_key, store: r.store_location,
      division: r.division, district: r.district, area: r.area, areaId: r.area_id,
      groupId: r.group_id, groupName: r.group_name,
      base: Number(r.base_rate || 0), additional: Number(r.additional_per_kg || 0),
      weightSlabs: r.weight_slabs || '',
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/assignments/sync', auth, async (req, res) => {
  const assignments = req.body;
  if (!Array.isArray(assignments)) return res.status(400).json({ message: 'Array expected' });
  try {
    await pool.query('DELETE FROM delivery_area_assignments');
    if (assignments.length) {
      // Deduplicate by assignment_key to avoid PRIMARY KEY conflicts
      const seen = new Map();
      for (const a of assignments) seen.set(a.key, a);
      const deduped = [...seen.values()];
      const vals = deduped.map(a => [
        a.key, a.store || 'main', a.division, a.district, a.area, a.areaId, a.groupId,
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

// ── Area Overrides (statuses + custom areas) ──────────────────────────────────

// GET /area-overrides – return all stored overrides
router.get('/area-overrides', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT area_key, division, district, area_name, status, is_custom FROM delivery_area_overrides ORDER BY division, district, area_name'
    );
    res.json(rows.map(r => ({
      key: r.area_key, division: r.division, district: r.district,
      area: r.area_name, status: r.status, isCustom: r.is_custom === 1,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /area-statuses/sync – save batch of status overrides (only Disable stored; Enable = default)
router.post('/area-statuses/sync', auth, async (req, res) => {
  const statuses = req.body; // { [areaKey]: 'Enable' | 'Disable' }
  if (!statuses || typeof statuses !== 'object') return res.status(400).json({ message: 'Object expected' });
  try {
    // Remove all existing non-custom rows, then reinsert the disabled ones
    await pool.query('DELETE FROM delivery_area_overrides WHERE is_custom = 0');
    const disabled = Object.entries(statuses).filter(([, s]) => s === 'Disable');
    if (disabled.length) {
      await pool.query(
        'INSERT INTO delivery_area_overrides (area_key, status, is_custom) VALUES ? ON DUPLICATE KEY UPDATE status = VALUES(status)',
        [disabled.map(([k]) => [k, 'Disable', 0])]
      );
    }
    res.json({ ok: true, saved: disabled.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /area-overrides/custom – add a custom area not in the BD hierarchy
router.post('/area-overrides/custom', auth, async (req, res) => {
  const { key, division, district, area } = req.body;
  if (!area || !key) return res.status(400).json({ message: 'key and area required' });
  try {
    await pool.query(
      `INSERT INTO delivery_area_overrides (area_key, division, district, area_name, status, is_custom)
       VALUES (?, ?, ?, ?, 'Enable', 1)
       ON DUPLICATE KEY UPDATE division = VALUES(division), district = VALUES(district), area_name = VALUES(area_name)`,
      [key, division || '', district || '', area]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /district-rename – rename a district in all custom overrides
router.post('/district-rename', auth, async (req, res) => {
  const { division, oldDistrict, newDistrict } = req.body;
  if (!oldDistrict || !newDistrict) return res.status(400).json({ message: 'oldDistrict and newDistrict required' });
  try {
    await pool.query(
      'UPDATE delivery_area_overrides SET district = ? WHERE division = ? AND district = ? AND is_custom = 1',
      [newDistrict, division || '', oldDistrict]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /area-overrides/custom/:key – remove a custom area
router.delete('/area-overrides/custom/:key', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM delivery_area_overrides WHERE area_key = ? AND is_custom = 1',
      [decodeURIComponent(req.params.key)]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Charge Lookup ─────────────────────────────────────────────────────────────
// GET /api/delivery-rates/charge?district=Dhaka&area=Mirpur&weight=2
router.get('/charge', async (req, res) => {
  const { district, area, weight = 1 } = req.query;
  const kg = Math.max(0.1, parseFloat(weight) || 1);
  try {
    let row;
    if (area) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE a.area = ? AND a.district = ? LIMIT 1`,
        [area, district || '']
      );
      if (rows.length) row = rows[0];
    }
    if (!row && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name,
                a.district, a.division, a.area
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id
         WHERE a.district = ? LIMIT 1`,
        [district]
      );
      if (rows.length) row = rows[0];
    }
    if (!row) return res.json({ charge: 0, groupName: null, matched: false });

    const charge = calcCharge(
      Number(row.base_rate), Number(row.additional_per_kg), row.weight_slabs, kg
    );
    res.json({
      charge, matched: true,
      base: Number(row.base_rate),
      additionalPerKg: Number(row.additional_per_kg),
      weightSlabs: row.weight_slabs || '',
      groupName: row.group_name,
      district: row.district, division: row.division, area: row.area,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
