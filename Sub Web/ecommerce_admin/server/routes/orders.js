const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildShippingAddress(row) {
  // Prefer shipping_* columns; fall back to delivery_* for backwards compatibility
  if (row.shipping_name || row.shipping_street || row.shipping_city) {
    return {
      name:    row.shipping_name    || '',
      phone:   row.shipping_phone   || '',
      street:  row.shipping_street  || '',
      city:    row.shipping_city    || '',
      state:   row.shipping_state   || '',
      zipCode: row.shipping_zip_code || '',
      country: row.shipping_country || '',
    };
  }
  return {
    name:    row.delivery_full_name   || '',
    phone:   row.delivery_phone       || '',
    street:  [row.delivery_address_line1, row.delivery_address_line2].filter(Boolean).join(', '),
    city:    row.delivery_city        || '',
    state:   row.delivery_area        || '',
    zipCode: row.delivery_postal_code || '',
    country: 'Bangladesh',
  };
}

function fmtOrder(row, items = [], statusHistory = []) {
  return {
    _id:         row.id,
    orderNumber: row.order_number,
    customerId:  row.customer_name !== undefined
      ? { _id: row.customer_id, name: row.customer_name, email: row.customer_email, phone: row.customer_phone }
      : row.customer_id,
    items,
    shippingAddress: buildShippingAddress(row),
    subtotal:     row.subtotal,
    shipping:     row.shipping,
    deliveryCharge: row.delivery_charge,
    tax:          row.tax,
    discount:     row.discount,
    total:        row.total,
    status:       row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    trackingNumber: row.tracking_number,
    courierName:  row.courier_name,
    estimatedDeliveryDate: row.estimated_delivery_date,
    notes:        row.notes,
    statusHistory,
    deliveredAt:  row.delivered_at,
    cancelledAt:  row.cancelled_at,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

async function fetchOrderFull(id) {
  const [[row]] = await pool.query(
    `SELECT o.*,
            c.name  AS customer_name,  c.email AS customer_email, c.phone AS customer_phone
     FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.id = ? LIMIT 1`,
    [id]
  );
  if (!row) return null;

  const [items] = await pool.query(
    `SELECT oi.*, p.thumbnail AS p_thumb, p.name AS p_name
     FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [id]
  );

  const [history] = await pool.query(
    'SELECT status, note, updated_at AS updatedAt FROM order_status_history WHERE order_id = ? ORDER BY updated_at ASC',
    [id]
  );

  const fmtItems = items.map(it => ({
    _id:         it.id,
    productId:   { _id: it.product_id, name: it.product_name || it.p_name, images: it.product_image ? [it.product_image] : [] },
    productName: it.product_name,
    quantity:    it.quantity,
    price:       it.price,
    total:       it.total,
    image:       it.product_image,
  }));

  return fmtOrder(row, fmtItems, history);
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// Export CSV
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus, from, to } = req.query;
    const conditions = [];
    const params = [];
    if (status)        { conditions.push('o.status = ?');         params.push(status); }
    if (paymentStatus) { conditions.push('o.payment_status = ?'); params.push(paymentStatus); }
    if (from)          { conditions.push('o.created_at >= ?');    params.push(new Date(from)); }
    if (to)            { conditions.push('o.created_at <= ?');    params.push(new Date(to + 'T23:59:59')); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       ${where} ORDER BY o.created_at DESC`,
      params
    );

    const rows = [['Order #', 'Customer', 'Email', 'Phone', 'Items', 'Subtotal', 'Shipping', 'Discount', 'Total', 'Status', 'Payment Status', 'Payment Method', 'City', 'Address', 'Date']];
    for (const o of orders) {
      const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM order_items WHERE order_id = ?', [o.id]);
      const addr = buildShippingAddress(o);
      rows.push([
        o.order_number, o.customer_name || '', o.customer_email || '', o.customer_phone || '',
        cnt, o.subtotal || 0, o.shipping || 0, o.discount || 0, o.total,
        o.status, o.payment_status, o.payment_method || '',
        addr.city, [addr.street, addr.city].filter(Boolean).join(', '),
        new Date(o.created_at).toISOString().split('T')[0],
      ]);
    }

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk actions
router.post('/bulk-action', authMiddleware, async (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: 'No order IDs provided' });

    const placeholders = ids.map(() => '?').join(',');
    if (action === 'delete') {
      await pool.query(`DELETE FROM orders WHERE id IN (${placeholders})`, ids);
      return res.json({ updated: ids.length, message: 'Orders deleted' });
    }

    let field;
    if (action === 'status')        field = 'status';
    else if (action === 'paymentStatus') field = 'payment_status';
    else return res.status(400).json({ message: 'Invalid action' });

    const [result] = await pool.query(
      `UPDATE orders SET ${field} = ? WHERE id IN (${placeholders})`,
      [value, ...ids]
    );
    res.json({ updated: result.affectedRows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public tracking
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT * FROM orders WHERE order_number LIKE ? LIMIT 1`,
      [`%${req.params.orderNumber}%`]
    );
    if (!row) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [row.id]);
    const [history] = await pool.query(
      'SELECT status, note, updated_at AS updatedAt FROM order_status_history WHERE order_id = ? ORDER BY updated_at ASC',
      [row.id]
    );

    res.json(fmtOrder(row, items.map(it => ({
      _id: it.id, productId: it.product_id, productName: it.product_name,
      quantity: it.quantity, price: it.price, total: it.total,
    })), history));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus, search, customer, from, to } = req.query;
    const conditions = [];
    const params = [];

    if (status)        { conditions.push('o.status = ?');         params.push(status); }
    if (paymentStatus) { conditions.push('o.payment_status = ?'); params.push(paymentStatus); }
    if (customer)      { conditions.push('o.customer_id = ?');    params.push(customer); }
    if (from)          { conditions.push('o.created_at >= ?');    params.push(new Date(from)); }
    if (to)            { conditions.push('o.created_at <= ?');    params.push(new Date(to + 'T23:59:59')); }

    let where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    if (search) {
      const searchCond = `(o.order_number LIKE ? OR c.name LIKE ?)`;
      where = where ? `${where} AND ${searchCond}` : `WHERE ${searchCond}`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       ${where} ORDER BY o.created_at DESC`,
      params
    );

    const result = [];
    for (const o of orders) {
      const [items] = await pool.query(
        'SELECT oi.* FROM order_items oi WHERE oi.order_id = ?', [o.id]
      );
      result.push(fmtOrder(o, items.map(it => ({
        _id: it.id, productId: it.product_id, productName: it.product_name,
        quantity: it.quantity, price: it.price, total: it.total, image: it.product_image,
      }))));
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerId, items = [], shippingAddress = {}, subtotal = 0, shipping = 0, tax = 0, discount = 0, total = 0, paymentMethod, paymentStatus = 'pending', status = 'pending', notes = '' } = req.body;

    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM orders');
    const orderNumber = `#ORD-${String(cnt + 1).padStart(5, '0')}`;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO orders
         (order_number, customer_id, subtotal, shipping, tax, discount, total,
          payment_method, payment_status, status, notes,
          shipping_name, shipping_phone, shipping_street, shipping_city,
          shipping_state, shipping_zip_code, shipping_country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, customerId || null, subtotal, shipping, tax, discount, total,
          paymentMethod || 'cash_on_delivery', paymentStatus, status, notes,
          shippingAddress.name || '', shippingAddress.phone || '', shippingAddress.street || '',
          shippingAddress.city || '', shippingAddress.state || '', shippingAddress.zipCode || '',
          shippingAddress.country || '',
        ]
      );

      const orderId = result.insertId;

      for (const item of items) {
        await conn.query(
          'INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.productId, item.productName || '', item.image || '', item.quantity, item.price, item.total || item.price * item.quantity]
        );
      }

      if (customerId) {
        await conn.query(
          'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?',
          [total, customerId]
        );
      }

      await conn.commit();
      const order = await fetchOrderFull(orderId);
      res.status(201).json(order);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { shippingAddress, notes, paymentMethod, paymentStatus, status, trackingNumber, courierName, estimatedDeliveryDate } = req.body;
    const fields = {};

    if (notes !== undefined)              fields.notes          = notes;
    if (paymentMethod !== undefined)      fields.payment_method = paymentMethod;
    if (paymentStatus !== undefined)      fields.payment_status = paymentStatus;
    if (status !== undefined)             fields.status         = status;
    if (trackingNumber !== undefined)     fields.tracking_number = trackingNumber;
    if (courierName !== undefined)        fields.courier_name   = courierName;
    if (estimatedDeliveryDate)            fields.estimated_delivery_date = new Date(estimatedDeliveryDate);
    if (shippingAddress) {
      fields.shipping_name     = shippingAddress.name    || '';
      fields.shipping_phone    = shippingAddress.phone   || '';
      fields.shipping_street   = shippingAddress.street  || '';
      fields.shipping_city     = shippingAddress.city    || '';
      fields.shipping_state    = shippingAddress.state   || '';
      fields.shipping_zip_code = shippingAddress.zipCode || '';
      fields.shipping_country  = shippingAddress.country || '';
    }

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE orders SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, note } = req.body;
    const updates = { status };
    if (status === 'delivered') updates.delivered_at = new Date();
    if (status === 'cancelled') updates.cancelled_at = new Date();

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE orders SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    await pool.query(
      'INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)',
      [req.params.id, status, note || '']
    );

    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.patch('/:id/payment-status', authMiddleware, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, req.params.id]);
    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign tracking
router.patch('/:id/tracking', authMiddleware, async (req, res) => {
  try {
    const { trackingNumber, courierName, estimatedDeliveryDate } = req.body;
    const fields = {};
    if (trackingNumber !== undefined)     fields.tracking_number = trackingNumber;
    if (courierName !== undefined)        fields.courier_name = courierName;
    if (estimatedDeliveryDate)            fields.estimated_delivery_date = new Date(estimatedDeliveryDate);

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE orders SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add note
router.patch('/:id/note', authMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    await pool.query('UPDATE orders SET notes = ? WHERE id = ?', [note, req.params.id]);
    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Invoice data
router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const order = await fetchOrderFull(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[ord]] = await pool.query('SELECT id FROM orders WHERE id = ? LIMIT 1', [req.params.id]);
    if (!ord) return res.status(404).json({ message: 'Order not found' });
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
