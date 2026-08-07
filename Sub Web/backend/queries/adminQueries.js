const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    name:      row.name,
    email:     row.email,
    role:      row.role,
    isActive:  !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM admins WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, is_active, created_at, updated_at FROM admins WHERE id = ? LIMIT 1',
    [id]
  );
  return fmt(rows[0]);
}

async function create({ name, email, password, role = 'admin' }) {
  const [result] = await pool.query(
    'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const allowed = ['name', 'email', 'password', 'role', 'is_active'];
  const setClauses = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (!setClauses.length) return findById(id);
  values.push(id);
  await pool.query(`UPDATE admins SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function findAll({ page = 1, limit = 20, role } = {}) {
  const offset = (page - 1) * limit;
  const where  = role ? 'WHERE role = ?' : '';
  const params = role ? [role, limit, offset] : [limit, offset];
  const [rows] = await pool.query(
    `SELECT id, name, email, role, is_active, created_at, updated_at
     FROM admins ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    params
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM admins ${where}`,
    role ? [role] : []
  );
  return { admins: rows.map(fmt), total: countRows[0].total };
}

async function remove(id) {
  await pool.query('DELETE FROM admins WHERE id = ?', [id]);
}

module.exports = { findByEmail, findById, create, update, findAll, remove };
