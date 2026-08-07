const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    productId: row.product_id,
    customerId:row.customer_id,
    rating:    row.rating,
    title:     row.title,
    comment:   row.comment,
    status:    row.status,
    product:   row.product_name ? { _id: row.product_id, name: row.product_name, slug: row.product_slug } : undefined,
    customer:  row.customer_name ? { _id: row.customer_id, name: row.customer_name, email: row.customer_email } : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const JOIN = `
  LEFT JOIN products  p ON p.id  = r.product_id
  LEFT JOIN customers c ON c.id  = r.customer_id
`;
const SELECT = `
  r.*, p.name AS product_name, p.slug AS product_slug,
  c.name AS customer_name, c.email AS customer_email
`;

async function findAll({ page = 1, limit = 20, search, status, productId, customerId } = {}) {
  const conditions = [];
  const params = [];

  if (search)     { conditions.push('(p.name LIKE ? OR c.name LIKE ? OR r.comment LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status)     { conditions.push('r.status = ?'); params.push(status); }
  if (productId)  { conditions.push('r.product_id = ?'); params.push(productId); }
  if (customerId) { conditions.push('r.customer_id = ?'); params.push(customerId); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM reviews r ${JOIN} ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM reviews r ${JOIN} ${where}`, params
  );
  return { reviews: rows.map(fmt), total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM reviews r ${JOIN} WHERE r.id = ? LIMIT 1`, [id]
  );
  return fmt(rows[0]);
}

async function findByProduct(productId, { page = 1, limit = 10, status = 'approved' } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM reviews r ${JOIN}
     WHERE r.product_id = ? AND r.status = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    [productId, status, limit, offset]
  );
  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM reviews WHERE product_id = ? AND status = ?',
    [productId, status]
  );
  return { reviews: rows.map(fmt), total: countRows[0].total };
}

async function create({ productId, customerId, rating, title = '', comment = '' }) {
  const [result] = await pool.query(
    'INSERT INTO reviews (product_id, customer_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)',
    [productId, customerId, rating, title, comment]
  );
  return findById(result.insertId);
}

async function update(id, { rating, title, comment }) {
  const sets = [];
  const vals = [];
  if (rating !== undefined)  { sets.push('rating = ?');  vals.push(rating); }
  if (title !== undefined)   { sets.push('title = ?');   vals.push(title); }
  if (comment !== undefined) { sets.push('comment = ?'); vals.push(comment); }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE reviews SET ${sets.join(', ')} WHERE id = ?`, vals); }
  return findById(id);
}

async function updateStatus(id, status) {
  await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
}

async function bulkUpdateStatus(ids, status) {
  if (!ids.length) return;
  const ph = ids.map(() => '?').join(', ');
  await pool.query(`UPDATE reviews SET status = ? WHERE id IN (${ph})`, [status, ...ids]);
}

async function bulkDelete(ids) {
  if (!ids.length) return;
  const ph = ids.map(() => '?').join(', ');
  await pool.query(`DELETE FROM reviews WHERE id IN (${ph})`, ids);
}

async function getStats() {
  const [[total], [byStatus], [avgRating]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS total FROM reviews'),
    pool.query('SELECT status, COUNT(*) AS count FROM reviews GROUP BY status'),
    pool.query('SELECT AVG(rating) AS avg FROM reviews WHERE status = "approved"'),
  ]);
  return { total: total[0].total, byStatus: byStatus[0], avgRating: avgRating[0].avg };
}

module.exports = { findAll, findById, findByProduct, create, update, updateStatus, remove, bulkUpdateStatus, bulkDelete, getStats };
