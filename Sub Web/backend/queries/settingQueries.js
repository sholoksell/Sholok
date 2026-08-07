const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  let value = row.value;
  if (row.data_type === 'number')  value = Number(value);
  if (row.data_type === 'boolean') value = value === 'true' || value === '1';
  if (row.data_type === 'json' || row.data_type === 'array') {
    try { value = JSON.parse(value); } catch { /* keep as string */ }
  }
  return { _id: row.id, key: row.setting_key, value, group: row.group_name, description: row.description, dataType: row.data_type, updatedAt: row.updated_at };
}

async function findAll(group = null) {
  const where  = group ? 'WHERE group_name = ?' : '';
  const params = group ? [group] : [];
  const [rows] = await pool.query(`SELECT * FROM settings ${where} ORDER BY group_name, setting_key`, params);
  return rows.map(fmt);
}

async function findByKey(key) {
  const [rows] = await pool.query('SELECT * FROM settings WHERE setting_key = ? LIMIT 1', [key]);
  return fmt(rows[0]);
}

async function get(key) {
  const setting = await findByKey(key);
  return setting ? setting.value : null;
}

async function set(key, value, { group = 'general', description = '', dataType = 'string' } = {}) {
  const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  await pool.query(
    `INSERT INTO settings (setting_key, value, group_name, description, data_type)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value), group_name = VALUES(group_name), data_type = VALUES(data_type)`,
    [key, strValue, group, description, dataType]
  );
  return findByKey(key);
}

async function setMany(entries) {
  for (const { key, value, group, description, dataType } of entries) {
    await set(key, value, { group, description, dataType });
  }
}

async function getGroup(group) {
  const rows = await findAll(group);
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

async function remove(key) {
  await pool.query('DELETE FROM settings WHERE setting_key = ?', [key]);
}

module.exports = { findAll, findByKey, get, set, setMany, getGroup, remove };
