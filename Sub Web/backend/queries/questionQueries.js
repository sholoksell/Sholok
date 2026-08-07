const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:         row.id,
    productId:   row.product_id,
    customerId:  row.customer_id,
    question:    row.question,
    answer:      row.answer,
    answeredBy:  row.answered_by,
    status:      row.status,
    isPublic:    !!row.is_public,
    product:     row.product_name  ? { _id: row.product_id,  name: row.product_name,  slug: row.product_slug }  : undefined,
    customer:    row.customer_name ? { _id: row.customer_id, name: row.customer_name, email: row.customer_email } : undefined,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

const JOIN = `
  LEFT JOIN products  p ON p.id = q.product_id
  LEFT JOIN customers c ON c.id = q.customer_id
`;
const SELECT = `
  q.*,
  p.name AS product_name, p.slug AS product_slug,
  c.name AS customer_name, c.email AS customer_email
`;

async function findAll({ page = 1, limit = 20, search, status, productId } = {}) {
  const conditions = [];
  const params = [];

  if (search)    { conditions.push('(p.name LIKE ? OR q.question LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (status)    { conditions.push('q.status = ?');     params.push(status); }
  if (productId) { conditions.push('q.product_id = ?'); params.push(productId); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM questions q ${JOIN} ${where} ORDER BY q.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM questions q ${JOIN} ${where}`, params
  );
  return { questions: rows.map(fmt), total: countRows[0].total };
}

async function findByProduct(productId, { page = 1, limit = 10, publicOnly = true } = {}) {
  const offset = (page - 1) * limit;
  const cond = publicOnly ? "AND q.status = 'answered' AND q.is_public = 1" : '';
  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM questions q ${JOIN}
     WHERE q.product_id = ? ${cond} ORDER BY q.created_at DESC LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM questions WHERE product_id = ? ${cond.replace('q.status', 'status').replace('q.is_public', 'is_public')}`,
    [productId]
  );
  return { questions: rows.map(fmt), total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM questions q ${JOIN} WHERE q.id = ? LIMIT 1`, [id]
  );
  return fmt(rows[0]);
}

async function create({ productId, customerId = null, question }) {
  const [result] = await pool.query(
    'INSERT INTO questions (product_id, customer_id, question) VALUES (?, ?, ?)',
    [productId, customerId, question]
  );
  return findById(result.insertId);
}

async function answer(id, { answer, answeredBy }) {
  await pool.query(
    "UPDATE questions SET answer = ?, answered_by = ?, status = 'answered' WHERE id = ?",
    [answer, answeredBy, id]
  );
  return findById(id);
}

async function updateStatus(id, status) {
  await pool.query('UPDATE questions SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
}

async function togglePublic(id, isPublic) {
  await pool.query('UPDATE questions SET is_public = ? WHERE id = ?', [isPublic ? 1 : 0, id]);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM questions WHERE id = ?', [id]);
}

async function getStats() {
  const [rows] = await pool.query(
    'SELECT status, COUNT(*) AS count FROM questions GROUP BY status'
  );
  return rows;
}

module.exports = { findAll, findByProduct, findById, create, answer, updateStatus, togglePublic, remove, getStats };
