const pool = require('../db');

function fmtShipping(row) {
  return {
    name: row.shipping_name, phone: row.shipping_phone, street: row.shipping_street,
    city: row.shipping_city, state: row.shipping_state, zipCode: row.shipping_zip_code, country: row.shipping_country,
  };
}

function fmtDelivery(row) {
  return {
    fullName: row.delivery_full_name, phone: row.delivery_phone,
    addressLine1: row.delivery_address_line1, addressLine2: row.delivery_address_line2,
    city: row.delivery_city, area: row.delivery_area, postalCode: row.delivery_postal_code,
    landmark: row.delivery_landmark, deliveryInstructions: row.delivery_instructions,
  };
}

function fmt(row, { items = [], statusHistory = [], customer = null } = {}) {
  if (!row) return null;
  return {
    _id:                   row.id,
    orderNumber:           row.order_number,
    customerId:            row.customer_id,
    customer,
    items,
    subtotal:              Number(row.subtotal),
    tax:                   Number(row.tax),
    shipping:              Number(row.shipping),
    deliveryCharge:        Number(row.delivery_charge),
    discount:              Number(row.discount),
    couponCode:            row.coupon_code,
    total:                 Number(row.total),
    status:                row.status,
    paymentStatus:         row.payment_status,
    paymentMethod:         row.payment_method,
    shippingAddress:       fmtShipping(row),
    deliveryAddress:       fmtDelivery(row),
    deliverySlot:          { date: row.delivery_slot_date, timeSlot: row.delivery_time_slot },
    estimatedDeliveryDate: row.estimated_delivery_date,
    deliveredAt:           row.delivered_at,
    cancelledAt:           row.cancelled_at,
    cancellationReason:    row.cancellation_reason,
    trackingNumber:        row.tracking_number,
    courierName:           row.courier_name,
    adminNote:             row.admin_note,
    notes:                 row.notes,
    statusHistory,
    createdAt:             row.created_at,
    updatedAt:             row.updated_at,
  };
}

async function _getItems(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ?', [orderId]
  );
  return rows.map(r => ({
    _id: r.id, productId: r.product_id, productName: r.product_name, productImage: r.product_image,
    variantId: r.variant_id, variantName: r.variant_name,
    quantity: r.quantity, price: Number(r.price), total: Number(r.total),
  }));
}

async function _getStatusHistory(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY updated_at ASC', [orderId]
  );
  return rows.map(r => ({ status: r.status, note: r.note, updatedAt: r.updated_at }));
}

async function findAll({ page = 1, limit = 20, search, status, paymentStatus, customerId, startDate, endDate } = {}) {
  const conditions = [];
  const params = [];

  if (search)        { conditions.push('(o.order_number LIKE ? OR c.name LIKE ? OR c.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status)        { conditions.push('o.status = ?'); params.push(status); }
  if (paymentStatus) { conditions.push('o.payment_status = ?'); params.push(paymentStatus); }
  if (customerId)    { conditions.push('o.customer_id = ?'); params.push(customerId); }
  if (startDate)     { conditions.push('o.created_at >= ?'); params.push(startDate); }
  if (endDate)       { conditions.push('o.created_at <= ?'); params.push(endDate); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM orders o LEFT JOIN customers c ON c.id = o.customer_id ${where}`, params
  );

  const orders = await Promise.all(rows.map(async row => {
    const customer = row.customer_name ? { _id: row.customer_id, name: row.customer_name, email: row.customer_email, phone: row.customer_phone } : null;
    const [items, statusHistory] = await Promise.all([_getItems(row.id), _getStatusHistory(row.id)]);
    return fmt(row, { items, statusHistory, customer });
  }));

  return { orders, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
     FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE o.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  const customer = row.customer_name ? { _id: row.customer_id, name: row.customer_name, email: row.customer_email, phone: row.customer_phone } : null;
  const [items, statusHistory] = await Promise.all([_getItems(id), _getStatusHistory(id)]);
  return fmt(row, { items, statusHistory, customer });
}

async function findByOrderNumber(orderNumber) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [orderNumber]);
  if (!rows[0]) return null;
  const [items, statusHistory] = await Promise.all([_getItems(rows[0].id), _getStatusHistory(rows[0].id)]);
  return fmt(rows[0], { items, statusHistory });
}

async function findByCustomer(customerId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [customerId, limit, offset]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM orders WHERE customer_id = ?', [customerId]);
  const orders = await Promise.all(rows.map(async row => {
    const [items] = await Promise.all([_getItems(row.id)]);
    return fmt(row, { items });
  }));
  return { orders, total: countRows[0].total };
}

async function create(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const sa = data.shippingAddress || {};
    const da = data.deliveryAddress || {};
    const ds = data.deliverySlot    || {};

    const [result] = await conn.query(
      `INSERT INTO orders
         (order_number, customer_id, subtotal, tax, shipping, delivery_charge, discount,
          coupon_code, total, status, payment_status, payment_method,
          shipping_name, shipping_phone, shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
          delivery_full_name, delivery_phone, delivery_address_line1, delivery_address_line2,
          delivery_city, delivery_area, delivery_postal_code, delivery_landmark, delivery_instructions,
          delivery_slot_date, delivery_time_slot, estimated_delivery_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.orderNumber, data.customerId, data.subtotal, data.tax || 0, data.shipping || 0,
        data.deliveryCharge || 0, data.discount || 0, data.couponCode || null, data.total,
        data.status || 'pending', data.paymentStatus || 'pending', data.paymentMethod || null,
        sa.name || '', sa.phone || '', sa.street || '', sa.city || '', sa.state || '', sa.zipCode || '', sa.country || '',
        da.fullName || '', da.phone || '', da.addressLine1 || '', da.addressLine2 || '',
        da.city || '', da.area || '', da.postalCode || '', da.landmark || '', da.deliveryInstructions || '',
        ds.date || null, ds.timeSlot || null, data.estimatedDeliveryDate || null, data.notes || '',
      ]
    );
    const orderId = result.insertId;

    if (data.items?.length) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, variant_id, variant_name, quantity, price, total) VALUES ?',
        [data.items.map(i => [orderId, i.productId, i.productName || '', i.productImage || '', i.variantId || null, i.variantName || null, i.quantity, i.price, i.total])]
      );
    }

    await conn.query(
      'INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)',
      [orderId, data.status || 'pending', 'Order created']
    );

    await conn.commit();
    return findById(orderId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function updateStatus(id, status, note = '') {
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  await pool.query(
    'INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)',
    [id, status, note]
  );
  return findById(id);
}

async function update(id, data) {
  const colMap = {
    status: 'status', paymentStatus: 'payment_status', paymentMethod: 'payment_method',
    trackingNumber: 'tracking_number', courierName: 'courier_name',
    adminNote: 'admin_note', notes: 'notes', cancellationReason: 'cancellation_reason',
    cancelledAt: 'cancelled_at', deliveredAt: 'delivered_at',
    estimatedDeliveryDate: 'estimated_delivery_date',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) { sets.push(`${col} = ?`); vals.push(data[js]); }
  }
  if (sets.length) {
    vals.push(id);
    await pool.query(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`, vals);
  }
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM orders WHERE id = ?', [id]);
}

async function getStats() {
  const [[totals], [statusCounts]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS total, SUM(total) AS revenue FROM orders'),
    pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
  ]);
  return { totals: totals[0], byStatus: statusCounts[0] };
}

module.exports = {
  findAll, findById, findByOrderNumber, findByCustomer,
  create, update, updateStatus, remove, getStats,
};
