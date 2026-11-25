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
        is_active    TINYINT(1) NOT NULL DEFAULT 1,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_change_history (
        id          INT PRIMARY KEY AUTO_INCREMENT,
        group_id    VARCHAR(60) NOT NULL,
        group_name  VARCHAR(200),
        store_location VARCHAR(100),
        field_changed VARCHAR(100),
        old_value   VARCHAR(200),
        new_value   VARCHAR(200),
        changed_by  VARCHAR(100),
        changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        note        TEXT,
        KEY idx_group (group_id),
        KEY idx_changed_at (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_backups (
        id          INT PRIMARY KEY AUTO_INCREMENT,
        label       VARCHAR(255) NOT NULL,
        data_json   LONGTEXT NOT NULL,
        created_by  VARCHAR(100),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes       TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    // Migrations — add missing columns to existing tables
    const migrations = [
      `ALTER TABLE delivery_rate_groups ADD COLUMN weight_slabs TEXT AFTER additional_per_kg`,
      `ALTER TABLE delivery_rate_groups ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER weight_slabs`,
      `ALTER TABLE delivery_rate_groups ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`,
      `ALTER TABLE delivery_area_assignments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN division VARCHAR(100) AFTER area_key`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN district VARCHAR(100) AFTER division`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN area VARCHAR(200) AFTER district`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN is_custom TINYINT(1) NOT NULL DEFAULT 0 AFTER status`,
      `ALTER TABLE delivery_area_overrides ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    ];
    for (const sql of migrations) {
      try { await pool.query(sql); } catch (e) { /* column already exists — ignore */ }
    }
    // One-time cleanup: remove malformed custom area keys
    const malformedKeys = [
      'Barishal|Barguna|Amtali1',
      'D-Dhaka-Dhaka-Bashundhara R/A (Block A-C)',
      'D-Dhaka-Dhaka-Bashundhara R/A (Block D-I)',
      'D-Dhaka-Dhaka-Bashundhara R/A (Block J-N)',
      'D-Rajshahi-Sirajganj-Chouhali',
      'Dhaka|Tangail|Ghatail1',
    ];
    await pool.query('DELETE FROM delivery_area_overrides WHERE area_key IN (?)', [malformedKeys]);
  } catch (e) {
    console.error('deliveryRates table init:', e.message);
  }
})();

// ── Rate Groups ───────────────────────────────────────────────────────────────

router.get('/rate-groups', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, store_location, name, base_rate, additional_per_kg, weight_slabs, is_active, created_at, updated_at FROM delivery_rate_groups ORDER BY store_location, name'
    );
    res.json(rows.map(r => ({
      id: r.id, store: r.store_location, name: r.name,
      base: Number(r.base_rate), additional: Number(r.additional_per_kg),
      weightSlabs: r.weight_slabs || undefined,
      isActive: r.is_active === 1,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/rate-groups/sync', auth, async (req, res) => {
  const groups = req.body;
  if (!Array.isArray(groups)) return res.status(400).json({ message: 'Array expected' });
  const conn = await pool.getConnection();
  try {
    // Load existing groups to detect changes for history
    const [existing] = await conn.query('SELECT id, name, base_rate, additional_per_kg, is_active FROM delivery_rate_groups');
    const existingMap = new Map(existing.map(g => [g.id, g]));

    await conn.beginTransaction();
    // Build history records for changed groups
    const historyRows = [];
    for (const g of groups) {
      const old = existingMap.get(g.id);
      if (!old) continue; // new group — no history needed
      if (Number(old.base_rate) !== Number(g.base)) {
        historyRows.push([g.id, g.name, g.store || 'Default', 'base_rate', String(old.base_rate), String(g.base), null, null]);
      }
      if (Number(old.additional_per_kg) !== Number(g.additional)) {
        historyRows.push([g.id, g.name, g.store || 'Default', 'additional_per_kg', String(old.additional_per_kg), String(g.additional), null, null]);
      }
      if ((old.is_active === 1) !== (g.isActive !== false)) {
        const wasActive = old.is_active === 1;
        const nowActive = g.isActive !== false;
        historyRows.push([g.id, g.name, g.store || 'Default', 'is_active', wasActive ? '1' : '0', nowActive ? '1' : '0', null, null]);
      }
    }

    await conn.query('DELETE FROM delivery_rate_groups');
    if (groups.length) {
      const vals = groups.map(g => [
        g.id, g.store || 'Default', g.name,
        Number(g.base), Number(g.additional),
        g.weightSlabs || null,
        g.isActive !== false ? 1 : 0,
      ]);
      await conn.query(
        'INSERT INTO delivery_rate_groups (id, store_location, name, base_rate, additional_per_kg, weight_slabs, is_active) VALUES ?',
        [vals]
      );
    }
    if (historyRows.length) {
      await conn.query(
        'INSERT INTO rate_change_history (group_id, group_name, store_location, field_changed, old_value, new_value, changed_by, note) VALUES ?',
        [historyRows]
      );
    }
    await conn.commit();
    res.json({ ok: true, count: groups.length });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
});

// Individual group endpoints
router.put('/rate-groups/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, base, additional, weightSlabs, isActive } = req.body;
  if (!name || base == null) return res.status(400).json({ message: 'name and base required' });
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT id, name, base_rate, additional_per_kg, is_active, store_location FROM delivery_rate_groups WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Group not found' });
    const old = existing[0];

    const historyRows = [];
    if (Number(old.base_rate) !== Number(base)) {
      historyRows.push([id, name, old.store_location, 'base_rate', String(old.base_rate), String(base), null, null]);
    }
    if (Number(old.additional_per_kg) !== Number(additional)) {
      historyRows.push([id, name, old.store_location, 'additional_per_kg', String(old.additional_per_kg), String(additional), null, null]);
    }
    if (old.name !== name) {
      historyRows.push([id, name, old.store_location, 'name', old.name, name, null, null]);
    }
    if (isActive !== undefined && (old.is_active === 1) !== Boolean(isActive)) {
      historyRows.push([id, name, old.store_location, 'is_active', old.is_active ? '1' : '0', isActive ? '1' : '0', null, null]);
    }

    await conn.beginTransaction();
    await conn.query(
      'UPDATE delivery_rate_groups SET name=?, base_rate=?, additional_per_kg=?, weight_slabs=?, is_active=? WHERE id=?',
      [name, Number(base), Number(additional) || 0, weightSlabs || null, isActive !== false ? 1 : 0, id]
    );
    if (historyRows.length) {
      await conn.query(
        'INSERT INTO rate_change_history (group_id, group_name, store_location, field_changed, old_value, new_value, changed_by, note) VALUES ?',
        [historyRows]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
});

router.patch('/rate-groups/:id/status', auth, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (isActive == null) return res.status(400).json({ message: 'isActive required' });
  try {
    const [existing] = await pool.query('SELECT id, name, store_location, is_active FROM delivery_rate_groups WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Group not found' });
    const old = existing[0];
    if ((old.is_active === 1) !== Boolean(isActive)) {
      await pool.query('UPDATE delivery_rate_groups SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
      await pool.query(
        'INSERT INTO rate_change_history (group_id, group_name, store_location, field_changed, old_value, new_value) VALUES (?,?,?,?,?,?)',
        [id, old.name, old.store_location, 'is_active', old.is_active ? '1' : '0', isActive ? '1' : '0']
      );
    }
    res.json({ ok: true, isActive: Boolean(isActive) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/rate-groups/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM delivery_rate_groups WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/rate-groups/:id/history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, field_changed, old_value, new_value, changed_by, changed_at, note FROM rate_change_history WHERE group_id = ? ORDER BY changed_at DESC LIMIT 100',
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Assignments ───────────────────────────────────────────────────────────────

router.get('/assignments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.assignment_key, a.store_location, a.division, a.district, a.area, a.area_id, a.group_id,
              g.name AS group_name, g.base_rate, g.additional_per_kg, g.weight_slabs AS group_weight_slabs,
              g.is_active AS group_is_active,
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
      groupIsActive: r.group_is_active === 1,
      baseOverride: r.override_base != null ? Number(r.override_base) : null,
      additionalOverride: r.override_additional != null ? Number(r.override_additional) : null,
      weightSlabsOverride: r.override_slabs || null,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/assignments/sync', auth, async (req, res) => {
  const assignments = req.body;
  if (!Array.isArray(assignments)) return res.status(400).json({ message: 'Array expected' });
  const conn = await pool.getConnection();
  try {
    const seen = new Map();
    for (const a of assignments) { if (a.key) seen.set(a.key, a); }
    const valid = [...seen.values()].filter(a => a.key && a.groupId);

    await conn.beginTransaction();
    await conn.query('DELETE FROM delivery_area_assignments');
    if (valid.length) {
      const vals = valid.map(a => [
        a.key, a.store || 'Dhaka', a.division || null, a.district || null,
        a.area || null, a.areaId || a.key, a.groupId,
      ]);
      await conn.query(
        `INSERT INTO delivery_area_assignments
           (assignment_key, store_location, division, district, area, area_id, group_id)
         VALUES ?`,
        [vals]
      );
    }
    await conn.commit();
    res.json({ ok: true, count: valid.length });
  } catch (e) {
    await conn.rollback();
    console.error('assignments/sync error:', e.message, e.code);
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
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
    const [result] = await pool.query('DELETE FROM delivery_zone_rate_overrides WHERE assignment_key = ?', [req.params.key]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'No override found for this area' });
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
  const statusMap = req.body;
  if (typeof statusMap !== 'object') return res.status(400).json({ message: 'Object expected' });
  try {
    const disabledKeys = Object.entries(statusMap).filter(([, v]) => v === 'Disable').map(([k]) => k);
    // Sync standard (non-custom) area statuses: delete all and re-insert disabled ones
    await pool.query(`DELETE FROM delivery_area_overrides WHERE is_custom = 0`);
    if (disabledKeys.length) {
      const vals = disabledKeys.map(k => [k, 'Disable', 0]);
      await pool.query(
        `INSERT INTO delivery_area_overrides (area_key, status, is_custom) VALUES ?
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [vals]
      );
    }
    // Sync custom area statuses: reset all to Enable, then disable the ones in the list
    await pool.query(`UPDATE delivery_area_overrides SET status = 'Enable' WHERE is_custom = 1`);
    if (disabledKeys.length) {
      await pool.query(
        `UPDATE delivery_area_overrides SET status = 'Disable' WHERE is_custom = 1 AND area_key IN (?)`,
        [disabledKeys]
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
       ON DUPLICATE KEY UPDATE division = VALUES(division), district = VALUES(district), area = VALUES(area), status = 'Enable', is_custom = 1`,
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
  const { division, oldDistrict, newDistrict, standardAreas } = req.body;
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
    if (Array.isArray(standardAreas) && standardAreas.length > 0) {
      const vals = standardAreas.map(a => [a.key, division, newDistrict, a.area, 1]);
      await pool.query(
        `INSERT INTO delivery_area_overrides (area_key, division, district, area, is_custom)
         VALUES ?
         ON DUPLICATE KEY UPDATE division = VALUES(division), district = VALUES(district), area = VALUES(area)`,
        [vals]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Stats (dashboard) ─────────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [[groupStats]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(is_active) AS active_count FROM delivery_rate_groups'
    );
    const [[assignStats]] = await pool.query(
      'SELECT COUNT(*) AS total FROM delivery_area_assignments'
    );
    const [[disabledStats]] = await pool.query(
      `SELECT COUNT(*) AS total FROM delivery_area_overrides WHERE is_custom = 0 AND status = 'Disable'`
    );
    const [[backupStats]] = await pool.query(
      'SELECT COUNT(*) AS total, MAX(created_at) AS last_backup FROM delivery_backups'
    );
    const [[historyStats]] = await pool.query(
      'SELECT COUNT(*) AS total FROM rate_change_history'
    );
    res.json({
      groups: { total: Number(groupStats.total), active: Number(groupStats.active_count) },
      assignments: { total: Number(assignStats.total) },
      disabledAreas: Number(disabledStats.total),
      backups: { total: Number(backupStats.total), lastAt: backupStats.last_backup },
      rateChanges: Number(historyStats.total),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Backup & Restore ──────────────────────────────────────────────────────────

router.get('/backups', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, label, created_by, created_at, notes, LENGTH(data_json) AS size_bytes FROM delivery_backups ORDER BY created_at DESC LIMIT 50'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/backups', auth, async (req, res) => {
  const { label, notes } = req.body;
  if (!label) return res.status(400).json({ message: 'label required' });
  try {
    const [groups] = await pool.query(
      'SELECT id, store_location, name, base_rate, additional_per_kg, weight_slabs, is_active FROM delivery_rate_groups'
    );
    const [assignments] = await pool.query(
      'SELECT assignment_key, store_location, division, district, area, area_id, group_id FROM delivery_area_assignments'
    );
    const [overrides] = await pool.query(
      'SELECT area_key, division, district, area, status, is_custom FROM delivery_area_overrides'
    );
    const [zoneOverrides] = await pool.query(
      'SELECT assignment_key, base_rate, additional_per_kg, weight_slabs FROM delivery_zone_rate_overrides'
    );
    const snapshot = {
      version: 2,
      createdAt: new Date().toISOString(),
      groups: groups.map(g => ({
        id: g.id, store: g.store_location, name: g.name,
        base: Number(g.base_rate), additional: Number(g.additional_per_kg),
        weightSlabs: g.weight_slabs, isActive: g.is_active === 1,
      })),
      assignments: assignments.map(a => ({
        key: a.assignment_key, store: a.store_location,
        division: a.division, district: a.district, area: a.area,
        areaId: a.area_id, groupId: a.group_id,
      })),
      areaOverrides: overrides,
      zoneOverrides: zoneOverrides.map(o => ({
        key: o.assignment_key,
        base: Number(o.base_rate), additional: Number(o.additional_per_kg),
        weightSlabs: o.weight_slabs,
      })),
    };
    const [result] = await pool.query(
      'INSERT INTO delivery_backups (label, data_json, notes) VALUES (?, ?, ?)',
      [label, JSON.stringify(snapshot), notes || null]
    );
    res.json({ ok: true, id: result.insertId, label, size: JSON.stringify(snapshot).length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/backups/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM delivery_backups WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Backup not found' });
    const row = rows[0];
    res.json({ ...row, data: JSON.parse(row.data_json) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/backups/:id/restore', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT data_json FROM delivery_backups WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Backup not found' });
    const snapshot = JSON.parse(rows[0].data_json);

    await conn.beginTransaction();

    // Restore groups
    await conn.query('DELETE FROM delivery_rate_groups');
    if (snapshot.groups && snapshot.groups.length) {
      const vals = snapshot.groups.map(g => [
        g.id, g.store || 'Default', g.name,
        Number(g.base), Number(g.additional),
        g.weightSlabs || null, g.isActive !== false ? 1 : 0,
      ]);
      await conn.query(
        'INSERT INTO delivery_rate_groups (id, store_location, name, base_rate, additional_per_kg, weight_slabs, is_active) VALUES ?',
        [vals]
      );
    }

    // Restore assignments
    await conn.query('DELETE FROM delivery_area_assignments');
    if (snapshot.assignments && snapshot.assignments.length) {
      const vals = snapshot.assignments.map(a => [
        a.key, a.store || 'Default', a.division, a.district,
        a.area, a.areaId || a.key, a.groupId,
      ]);
      await conn.query(
        'INSERT INTO delivery_area_assignments (assignment_key, store_location, division, district, area, area_id, group_id) VALUES ?',
        [vals]
      );
    }

    // Restore area overrides
    await conn.query('DELETE FROM delivery_area_overrides');
    if (snapshot.areaOverrides && snapshot.areaOverrides.length) {
      const vals = snapshot.areaOverrides.map(o => [
        o.area_key || o.key, o.division, o.district, o.area, o.status || 'Enable', o.is_custom || 0,
      ]);
      await conn.query(
        'INSERT INTO delivery_area_overrides (area_key, division, district, area, status, is_custom) VALUES ?',
        [vals]
      );
    }

    // Restore zone overrides
    await conn.query('DELETE FROM delivery_zone_rate_overrides');
    if (snapshot.zoneOverrides && snapshot.zoneOverrides.length) {
      const vals = snapshot.zoneOverrides.map(o => [
        o.key || o.assignment_key, Number(o.base || o.base_rate), Number(o.additional || o.additional_per_kg || 0), o.weightSlabs || o.weight_slabs || null,
      ]);
      await conn.query(
        'INSERT INTO delivery_zone_rate_overrides (assignment_key, base_rate, additional_per_kg, weight_slabs) VALUES ?',
        [vals]
      );
    }

    await conn.commit();
    res.json({ ok: true, restored: { groups: snapshot.groups?.length || 0, assignments: snapshot.assignments?.length || 0 } });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
});

router.delete('/backups/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM delivery_backups WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Charge Lookup ─────────────────────────────────────────────────────────────

router.get('/charge', async (req, res) => {
  const { division, district, area, weight = 1 } = req.query;
  const kg = Math.max(1, parseFloat(weight) || 1);
  try {
    // Check if this area is explicitly disabled
    if (division && district && area) {
      const aKey = `${division}|${district}|${area}`;
      const [disabledRows] = await pool.query(
        `SELECT status FROM delivery_area_overrides WHERE area_key = ? AND status = 'Disable' LIMIT 1`,
        [aKey]
      );
      if (disabledRows.length) {
        return res.json({ charge: null, groupName: null, matched: false, disabled: true });
      }
    }

    let row;
    // 1. Precise lookup by assignment_key — only active rate groups
    if (division && district && area) {
      const aKey = `${division}|${district}|${area}`;
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name, g.is_active,
                a.district, a.division, a.area,
                o.base_rate AS override_base, o.additional_per_kg AS override_additional, o.weight_slabs AS override_slabs
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id AND g.is_active = 1
         LEFT JOIN delivery_zone_rate_overrides o ON o.assignment_key = a.assignment_key
         WHERE a.assignment_key = ?
         LIMIT 1`,
        [aKey]
      );
      if (rows.length) row = rows[0];
    }
    // 2. Fallback: exact area + district match
    if (!row && area && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name,
                a.district, a.division, a.area,
                o.base_rate AS override_base, o.additional_per_kg AS override_additional, o.weight_slabs AS override_slabs
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id AND g.is_active = 1
         LEFT JOIN delivery_zone_rate_overrides o ON o.assignment_key = a.assignment_key
         WHERE LOWER(a.area) = LOWER(?) AND LOWER(a.district) = LOWER(?)
         LIMIT 1`,
        [area, district]
      );
      if (rows.length) row = rows[0];
    }
    // 3. District-only fallback
    if (!row && district) {
      const [rows] = await pool.query(
        `SELECT g.base_rate, g.additional_per_kg, g.weight_slabs, g.name AS group_name,
                a.district, a.division, a.area,
                o.base_rate AS override_base, o.additional_per_kg AS override_additional, o.weight_slabs AS override_slabs
         FROM delivery_area_assignments a
         JOIN delivery_rate_groups g ON g.id = a.group_id AND g.is_active = 1
         LEFT JOIN delivery_zone_rate_overrides o ON o.assignment_key = a.assignment_key
         WHERE LOWER(a.district) = LOWER(?)
         LIMIT 1`,
        [district]
      );
      if (rows.length) row = rows[0];
    }
    // 4. Final fallback: delivery_areas table
    if (!row) {
      let legacyCharge = null;
      if (area && district) {
        const [lr] = await pool.query(
          `SELECT delivery_charge FROM delivery_areas
           WHERE LOWER(name) = LOWER(?) AND LOWER(city) = LOWER(?) AND is_active = 1 LIMIT 1`,
          [area, district]
        );
        if (lr.length) legacyCharge = Number(lr[0].delivery_charge);
      }
      if (legacyCharge === null && district) {
        const [lr] = await pool.query(
          `SELECT MIN(delivery_charge) AS min_charge FROM delivery_areas
           WHERE LOWER(city) = LOWER(?) AND is_active = 1`,
          [district]
        );
        if (lr.length && lr[0].min_charge !== null) legacyCharge = Number(lr[0].min_charge);
      }
      if (legacyCharge !== null) {
        return res.json({
          charge: legacyCharge, base: legacyCharge, additionalPerKg: 0,
          groupName: 'Standard Rate', district, area, matched: true, source: 'area_table',
        });
      }
      return res.json({ charge: null, groupName: null, matched: false });
    }

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
      matched: true, source: 'rate_group',
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/delivery-rates/geo — unique divisions/districts from configured rate assignments
router.get('/geo', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT division, district FROM delivery_area_assignments WHERE division IS NOT NULL AND district IS NOT NULL ORDER BY division, district'
    );
    const divMap = {};
    for (const r of rows) {
      if (!divMap[r.division]) divMap[r.division] = [];
      if (!divMap[r.division].includes(r.district)) divMap[r.division].push(r.district);
    }
    res.json({
      divisions: Object.keys(divMap).sort(),
      districtsByDivision: divMap,
    });
  } catch (e) {
    res.status(500).json({ message: e.message, divisions: [], districtsByDivision: {} });
  }
});

module.exports = router;
