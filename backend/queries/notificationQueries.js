const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    userId:    row.user_id,
    userType:  row.user_type,
    title:     row.title,
    message:   row.message,
    type:      row.type,
    isRead:    !!row.is_read,
    data:      row.data,
    link:      row.link,
    createdAt: row.created_at,
  };
}

async function findByUser(userId, userType, { page = 1, limit = 30, unreadOnly = false } = {}) {
  const offset = (page - 1) * limit;
  const cond = unreadOnly ? 'AND is_read = 0' : '';
  const [rows] = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = ? AND user_type = ? ${cond}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, userType, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND user_type = ? ${cond}`,
    [userId, userType]
  );
  return { notifications: rows.map(fmt), total: countRows[0].total };
}

async function create(userId, userType, { title, message, type = 'info', data = null, link = '' }) {
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, user_type, title, message, type, data, link) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, userType, title, message, type, data ? JSON.stringify(data) : null, link]
  );
  const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  return fmt(rows[0]);
}

async function markRead(id, userId, userType) {
  await pool.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND user_type = ?',
    [id, userId, userType]
  );
}

async function markAllRead(userId, userType) {
  await pool.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_type = ?',
    [userId, userType]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
}

async function countUnread(userId, userType) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND user_type = ? AND is_read = 0',
    [userId, userType]
  );
  return rows[0].count;
}

async function bulkCreate(userIds, userType, payload) {
  if (!userIds.length) return;
  const { title, message, type = 'info', link = '' } = payload;
  const values = userIds.map(uid => [uid, userType, title, message, type, link]);
  await pool.query(
    'INSERT INTO notifications (user_id, user_type, title, message, type, link) VALUES ?',
    [values]
  );
}

module.exports = { findByUser, create, markRead, markAllRead, remove, countUnread, bulkCreate };
