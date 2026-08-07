const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    orderId:         row.order_id,
    transactionId:   row.transaction_id,
    amount:          Number(row.amount),
    method:          row.method,
    status:          row.status,
    gateway:         row.gateway,
    gatewayResponse: row.gateway_response,
    notes:           row.notes,
    verified:        !!row.verified,
    proofImage:      row.proof_image,
    refundAmount:    Number(row.refund_amount),
    refundType:      row.refund_type,
    refundReason:    row.refund_reason,
    refundTo:        row.refund_to,
    refundedAt:      row.refunded_at,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

async function findAll({ page = 1, limit = 20, search, status, method, startDate, endDate } = {}) {
  const conditions = [];
  const params = [];

  if (search)    { conditions.push('(p.transaction_id LIKE ? OR o.order_number LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (status)    { conditions.push('p.status = ?'); params.push(status); }
  if (method)    { conditions.push('p.method = ?'); params.push(method); }
  if (startDate) { conditions.push('p.created_at >= ?'); params.push(startDate); }
  if (endDate)   { conditions.push('p.created_at <= ?'); params.push(endDate); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT p.*, o.order_number, c.name AS customer_name
     FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     LEFT JOIN customers c ON c.id = o.customer_id
     ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     LEFT JOIN customers c ON c.id = o.customer_id ${where}`,
    params
  );

  return {
    payments: rows.map(r => ({ ...fmt(r), orderNumber: r.order_number, customerName: r.customer_name })),
    total: countRows[0].total,
  };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, o.order_number, c.name AS customer_name
     FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  return { ...fmt(rows[0]), orderNumber: rows[0].order_number, customerName: rows[0].customer_name };
}

async function findByOrderId(orderId) {
  const [rows] = await pool.query('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC', [orderId]);
  return rows.map(fmt);
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO payments
       (order_id, transaction_id, amount, method, status, gateway, gateway_response, notes, proof_image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.orderId, data.transactionId, data.amount, data.method,
      data.status || 'pending', data.gateway || '', data.gatewayResponse ? JSON.stringify(data.gatewayResponse) : null,
      data.notes || '', data.proofImage || '',
    ]
  );
  return findById(result.insertId);
}

async function updateStatus(id, status) {
  await pool.query('UPDATE payments SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
}

async function verify(id) {
  await pool.query('UPDATE payments SET verified = 1 WHERE id = ?', [id]);
  return findById(id);
}

async function refund(id, { refundAmount, refundType, refundReason, refundTo }) {
  await pool.query(
    `UPDATE payments SET
       status = 'refunded', refund_amount = ?, refund_type = ?, refund_reason = ?, refund_to = ?, refunded_at = NOW()
     WHERE id = ?`,
    [refundAmount, refundType, refundReason, refundTo, id]
  );
  return findById(id);
}

async function update(id, data) {
  const colMap = {
    status: 'status', gateway: 'gateway', gatewayResponse: 'gateway_response',
    notes: 'notes', verified: 'verified', proofImage: 'proof_image',
    refundAmount: 'refund_amount', refundType: 'refund_type', refundReason: 'refund_reason',
    refundTo: 'refund_to', refundedAt: 'refunded_at',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(js === 'verified' ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE payments SET ${sets.join(', ')} WHERE id = ?`, vals); }
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM payments WHERE id = ?', [id]);
}

async function getStats() {
  const [[totals], [byMethod], [byStatus]] = await Promise.all([
    pool.query("SELECT COUNT(*) AS total, SUM(amount) AS totalAmount FROM payments WHERE status = 'completed'"),
    pool.query('SELECT method, COUNT(*) AS count, SUM(amount) AS amount FROM payments GROUP BY method'),
    pool.query('SELECT status, COUNT(*) AS count FROM payments GROUP BY status'),
  ]);
  return { totals: totals[0], byMethod: byMethod[0], byStatus: byStatus[0] };
}

module.exports = { findAll, findById, findByOrderId, create, update, updateStatus, verify, refund, remove, getStats };
