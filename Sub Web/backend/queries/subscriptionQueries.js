const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    email:     row.email,
    name:      row.name,
    phone:     row.phone,
    status:    row.status,
    type:      row.type,
    createdAt: row.created_at,
  };
}

async function findAll({ page = 1, limit = 20, search, status, type } = {}) {
  const conditions = [];
  const params = [];

  if (search) { conditions.push('(email LIKE ? OR name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  if (type)   { conditions.push('type = ?');   params.push(type); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * FROM subscriptions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM subscriptions ${where}`, params
  );
  return { subscriptions: rows.map(fmt), total: countRows[0].total };
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM subscriptions WHERE email = ? LIMIT 1', [email]);
  return fmt(rows[0]);
}

async function subscribe({ email, name = '', phone = '', type = 'newsletter' }) {
  await pool.query(
    `INSERT INTO subscriptions (email, name, phone, type, status)
     VALUES (?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'active', type = VALUES(type)`,
    [email, name, phone, type]
  );
  return findByEmail(email);
}

async function unsubscribe(email) {
  await pool.query("UPDATE subscriptions SET status = 'unsubscribed' WHERE email = ?", [email]);
}

async function remove(id) {
  await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);
}

async function findActiveEmails(type = null) {
  const cond = type ? "AND type = ?" : '';
  const params = type ? ['active', type] : ['active'];
  const [rows] = await pool.query(
    `SELECT email, name FROM subscriptions WHERE status = ? ${cond}`, params
  );
  return rows;
}

async function getStats() {
  const [rows] = await pool.query(
    'SELECT status, type, COUNT(*) AS count FROM subscriptions GROUP BY status, type'
  );
  return rows;
}

module.exports = { findAll, findByEmail, subscribe, unsubscribe, remove, findActiveEmails, getStats };
