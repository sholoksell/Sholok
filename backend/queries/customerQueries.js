const pool = require('../db');

function fmt(row, { addresses = [], notifications = [], wishlist = [], rewardHistory = [] } = {}) {
  if (!row) return null;
  return {
    _id:                  row.id,
    name:                 row.name,
    email:                row.email,
    phone:                row.phone,
    totalOrders:          row.total_orders,
    totalSpent:           Number(row.total_spent),
    status:               row.status,
    group:                row.customer_group,
    groupDiscount:        Number(row.group_discount),
    rewardPoints:         row.reward_points,
    totalPointsEarned:    row.total_points_earned,
    totalPointsRedeemed:  row.total_points_redeemed,
    lastLoginDate:        row.last_login_date,
    lastLoginIp:          row.last_login_ip,
    isActivated:          !!row.is_activated,
    suspendedUntil:       row.suspended_until,
    addresses,
    notifications,
    wishlist,
    pointsHistory:        rewardHistory,
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

function fmtAddress(row) {
  return {
    _id:       row.id,
    label:     row.label,
    name:      row.name,
    phone:     row.phone,
    street:    row.street,
    city:      row.city,
    state:     row.state,
    zipCode:   row.zip_code,
    country:   row.country,
    type:      row.type,
    isDefault: !!row.is_default,
  };
}

async function _getAddresses(customerId) {
  const [rows] = await pool.query(
    'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC',
    [customerId]
  );
  return rows.map(fmtAddress);
}

async function _getNotifications(customerId) {
  const [rows] = await pool.query(
    'SELECT * FROM customer_notifications WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50',
    [customerId]
  );
  return rows.map(r => ({
    _id: r.id, title: r.title, message: r.message, type: r.type, read: !!r.is_read, createdAt: r.created_at,
  }));
}

async function _getWishlist(customerId) {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price
     FROM customer_wishlist cw
     JOIN products p ON p.id = cw.product_id
     WHERE cw.customer_id = ? ORDER BY cw.added_at DESC`,
    [customerId]
  );
  return rows.map(r => ({ _id: r.id, name: r.name, slug: r.slug, thumbnail: r.thumbnail, regularPrice: Number(r.regular_price), salePrice: r.sale_price != null ? Number(r.sale_price) : null }));
}

async function _getRewardHistory(customerId) {
  const [rows] = await pool.query(
    'SELECT * FROM customer_reward_history WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100',
    [customerId]
  );
  return rows.map(r => ({ _id: r.id, type: r.type, points: r.points, description: r.description, orderId: r.order_id, date: r.created_at }));
}

async function findAll({ page = 1, limit = 20, search, status, group } = {}) {
  const conditions = [];
  const params = [];

  if (search) { conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  if (group)  { conditions.push('customer_group = ?'); params.push(group); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT id, name, email, phone, total_orders, total_spent, status, customer_group,
            group_discount, reward_points, total_points_earned, total_points_redeemed,
            last_login_date, is_activated, suspended_until, created_at, updated_at
     FROM customers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM customers ${where}`, params);
  return { customers: rows.map(r => fmt(r)), total: countRows[0].total };
}

async function findById(id, { withRelations = false } = {}) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  if (!withRelations) return fmt(rows[0]);
  const [addresses, notifications, wishlist, rewardHistory] = await Promise.all([
    _getAddresses(id), _getNotifications(id), _getWishlist(id), _getRewardHistory(id),
  ]);
  return fmt(rows[0], { addresses, notifications, wishlist, rewardHistory });
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function create({ name, email, phone = '', password = null, activationToken = null }) {
  const [result] = await pool.query(
    'INSERT INTO customers (name, email, phone, password, activation_token) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, password, activationToken]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const colMap = {
    name: 'name', email: 'email', phone: 'phone', password: 'password',
    status: 'status', customerGroup: 'customer_group', groupDiscount: 'group_discount',
    rewardPoints: 'reward_points', totalPointsEarned: 'total_points_earned',
    totalPointsRedeemed: 'total_points_redeemed', totalOrders: 'total_orders',
    totalSpent: 'total_spent', lastLoginDate: 'last_login_date', lastLoginIp: 'last_login_ip',
    passwordResetToken: 'password_reset_token', passwordResetExpires: 'password_reset_expires',
    activationToken: 'activation_token', isActivated: 'is_activated', suspendedUntil: 'suspended_until',
  };
  const boolFields = new Set(['isActivated']);
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(boolFields.has(js) ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (!sets.length) return findById(id);
  vals.push(id);
  await pool.query(`UPDATE customers SET ${sets.join(', ')} WHERE id = ?`, vals);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM customers WHERE id = ?', [id]);
}

// ---- Addresses ----
async function getAddresses(customerId) { return _getAddresses(customerId); }

async function addAddress(customerId, data) {
  if (data.isDefault) {
    await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [customerId]);
  }
  const [result] = await pool.query(
    `INSERT INTO customer_addresses
       (customer_id, label, name, phone, street, city, state, zip_code, country, type, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [customerId, data.label || 'Home', data.name || '', data.phone || '', data.street || '',
     data.city || '', data.state || '', data.zipCode || '', data.country || 'Bangladesh',
     data.type || 'both', data.isDefault ? 1 : 0]
  );
  const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE id = ?', [result.insertId]);
  return fmtAddress(rows[0]);
}

async function updateAddress(customerId, addressId, data) {
  if (data.isDefault) {
    await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [customerId]);
  }
  const colMap = {
    label: 'label', name: 'name', phone: 'phone', street: 'street',
    city: 'city', state: 'state', zipCode: 'zip_code', country: 'country', type: 'type', isDefault: 'is_default',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) { sets.push(`${col} = ?`); vals.push(js === 'isDefault' ? (data[js] ? 1 : 0) : data[js]); }
  }
  if (sets.length) {
    vals.push(addressId, customerId);
    await pool.query(`UPDATE customer_addresses SET ${sets.join(', ')} WHERE id = ? AND customer_id = ?`, vals);
  }
  const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE id = ? AND customer_id = ?', [addressId, customerId]);
  return fmtAddress(rows[0]);
}

async function deleteAddress(customerId, addressId) {
  await pool.query('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [addressId, customerId]);
}

// ---- Notifications ----
async function getNotifications(customerId) { return _getNotifications(customerId); }

async function addNotification(customerId, { title, message, type = 'info' }) {
  await pool.query(
    'INSERT INTO customer_notifications (customer_id, title, message, type) VALUES (?, ?, ?, ?)',
    [customerId, title, message, type]
  );
}

async function markNotificationRead(customerId, notificationId) {
  await pool.query(
    'UPDATE customer_notifications SET is_read = 1 WHERE id = ? AND customer_id = ?',
    [notificationId, customerId]
  );
}

async function markAllNotificationsRead(customerId) {
  await pool.query('UPDATE customer_notifications SET is_read = 1 WHERE customer_id = ?', [customerId]);
}

// ---- Wishlist ----
async function getWishlist(customerId) { return _getWishlist(customerId); }

async function addToWishlist(customerId, productId) {
  await pool.query(
    'INSERT IGNORE INTO customer_wishlist (customer_id, product_id) VALUES (?, ?)',
    [customerId, productId]
  );
}

async function removeFromWishlist(customerId, productId) {
  await pool.query(
    'DELETE FROM customer_wishlist WHERE customer_id = ? AND product_id = ?',
    [customerId, productId]
  );
}

// ---- Reward Points ----
async function addRewardHistory(customerId, { type, points, description = '', orderId = null }) {
  await pool.query(
    'INSERT INTO customer_reward_history (customer_id, type, points, description, order_id) VALUES (?, ?, ?, ?, ?)',
    [customerId, type, points, description, orderId]
  );
}

// ---- Login History ----
async function addLoginHistory(customerId, { ip = '', device = '' }) {
  await pool.query(
    'INSERT INTO customer_login_history (customer_id, ip, device) VALUES (?, ?, ?)',
    [customerId, ip, device]
  );
}

async function getLoginHistory(customerId, limit = 20) {
  const [rows] = await pool.query(
    'SELECT ip, device, created_at AS date FROM customer_login_history WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?',
    [customerId, limit]
  );
  return rows;
}

// ---- Analytics ----
async function getAnalytics() {
  const [[total], [active], [blocked], [topSpenders]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM customers'),
    pool.query("SELECT COUNT(*) AS count FROM customers WHERE status = 'active'"),
    pool.query("SELECT COUNT(*) AS count FROM customers WHERE status = 'blocked'"),
    pool.query(
      'SELECT id, name, email, total_orders, total_spent FROM customers ORDER BY total_spent DESC LIMIT 5'
    ),
  ]);
  return {
    total: total[0].count, active: active[0].count, blocked: blocked[0].count,
    topSpenders: topSpenders[0],
  };
}

module.exports = {
  findAll, findById, findByEmail, create, update, remove,
  getAddresses, addAddress, updateAddress, deleteAddress,
  getNotifications, addNotification, markNotificationRead, markAllNotificationsRead,
  getWishlist, addToWishlist, removeFromWishlist,
  addRewardHistory, addLoginHistory, getLoginHistory, getAnalytics,
};
