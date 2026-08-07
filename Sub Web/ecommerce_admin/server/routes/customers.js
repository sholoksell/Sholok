const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const FINAL_STATUSES = ['delivered', 'cancelled', 'refunded'];

function fmtCustomer(row) {
  if (!row) return null;
  return {
    _id:                  row.id,
    name:                 row.name,
    email:                row.email,
    phone:                row.phone,
    status:               row.status,
    group:                row.customer_group,
    groupDiscount:        row.group_discount,
    totalOrders:          row.total_orders,
    totalSpent:           row.total_spent,
    rewardPoints:         row.reward_points,
    totalPointsEarned:    row.total_points_earned,
    totalPointsRedeemed:  row.total_points_redeemed,
    lastLoginDate:        row.last_login_date,
    lastLoginIp:          row.last_login_ip,
    isActivated:          !!row.is_activated,
    suspendedUntil:       row.suspended_until,
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

function fmtAddr(row) {
  return {
    _id: row.id, label: row.label, name: row.name, phone: row.phone,
    street: row.street, city: row.city, state: row.state,
    zipCode: row.zip_code, country: row.country,
    type: row.type, isDefault: !!row.is_default,
  };
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [[{ total }]]      = await pool.query('SELECT COUNT(*) AS total FROM customers');
    const [[{ newCustomers }]] = await pool.query('SELECT COUNT(*) AS newCustomers FROM customers WHERE created_at >= ?', [thirtyDaysAgo]);
    const [[{ returning }]]  = await pool.query('SELECT COUNT(*) AS returning FROM customers WHERE total_orders > 1');
    const [[{ activeRecently }]] = await pool.query('SELECT COUNT(*) AS activeRecently FROM customers WHERE last_login_date >= ?', [ninetyDaysAgo]);

    const [topSpenders] = await pool.query(
      'SELECT id AS _id, name, email, total_spent AS totalSpent, total_orders AS totalOrders, customer_group AS `group` FROM customers WHERE total_orders > 0 ORDER BY total_spent DESC LIMIT 10'
    );

    const [groupDist] = await pool.query(
      'SELECT customer_group AS _id, COUNT(*) AS count, SUM(total_spent) AS totalRevenue FROM customers GROUP BY customer_group'
    );

    const [[{ ltv }]]      = await pool.query('SELECT COALESCE(AVG(total_spent), 0) AS ltv FROM customers');
    const [[{ avgFreq }]]  = await pool.query('SELECT COALESCE(AVG(total_orders), 0) AS avgFreq FROM customers');
    const retentionRate    = total > 0 ? Math.round((returning / total) * 100) : 0;

    res.json({
      total, newLast30Days: newCustomers, returning, firstTime: total - returning,
      topSpenders, groupDistribution: groupDist,
      avgLifetimeValue:    Math.round(ltv),
      avgOrderFrequency:   Math.round(avgFreq * 10) / 10,
      retentionRate, activeRecently,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── EXPORT CSV ───────────────────────────────────────────────────────────────
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { status, group } = req.query;
    const conditions = [];
    const params = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (group)  { conditions.push('customer_group = ?'); params.push(group); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [customers] = await pool.query(`SELECT * FROM customers ${where}`, params);

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Group', 'GroupDiscount', 'TotalOrders', 'TotalSpent', 'RewardPoints', 'CreatedAt'];
    const rows = customers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      c.status || 'active',
      c.customer_group || 'regular',
      c.group_discount || 0,
      c.total_orders || 0,
      c.total_spent || 0,
      c.reward_points || 0,
      c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── IMPORT ───────────────────────────────────────────────────────────────────
router.post('/import', authMiddleware, async (req, res) => {
  try {
    const { customers: rows } = req.body;
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ message: 'No customer data provided' });
    }

    let imported = 0, skipped = 0;
    const errors = [];
    for (const row of rows) {
      try {
        if (!row.name || !row.email) { errors.push('Missing name/email'); skipped++; continue; }
        const [[existing]] = await pool.query('SELECT id FROM customers WHERE email = ? LIMIT 1', [row.email.toLowerCase()]);
        if (existing) { skipped++; continue; }

        await pool.query(
          `INSERT INTO customers (name, email, phone, status, customer_group, group_discount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            row.name, row.email.toLowerCase(), row.phone || '',
            ['active', 'inactive', 'blocked'].includes(row.status) ? row.status : 'active',
            ['regular', 'wholesale', 'vip', 'dealer'].includes(row.group) ? row.group : 'regular',
            parseFloat(row.groupDiscount) || 0,
          ]
        );
        imported++;
      } catch (e) {
        errors.push(e.message);
        skipped++;
      }
    }
    res.json({ imported, skipped, errors: errors.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADDRESS BOOK ─────────────────────────────────────────────────────────────
router.post('/:id/addresses', authMiddleware, async (req, res) => {
  try {
    const { label, name, phone, street, city, state, zipCode, country, type, isDefault } = req.body;
    if (isDefault) {
      await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.params.id]);
    }
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM customer_addresses WHERE customer_id = ?', [req.params.id]);
    const makeDefault = isDefault || cnt === 0 ? 1 : 0;
    await pool.query(
      'INSERT INTO customer_addresses (customer_id, label, name, phone, street, city, state, zip_code, country, type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, label || 'Home', name || '', phone || '', street || '', city || '', state || '', zipCode || '', country || '', type || 'both', makeDefault]
    );
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC', [req.params.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/addresses/:addrId', authMiddleware, async (req, res) => {
  try {
    const { label, name, phone, street, city, state, zipCode, country, type, isDefault } = req.body;
    if (isDefault) {
      await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.params.id]);
    }
    await pool.query(
      'UPDATE customer_addresses SET label = ?, name = ?, phone = ?, street = ?, city = ?, state = ?, zip_code = ?, country = ?, type = ?, is_default = ? WHERE id = ? AND customer_id = ?',
      [label || 'Home', name || '', phone || '', street || '', city || '', state || '', zipCode || '', country || '', type || 'both', isDefault ? 1 : 0, req.params.addrId, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC', [req.params.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id/addresses/:addrId', authMiddleware, async (req, res) => {
  try {
    const [[addr]] = await pool.query('SELECT * FROM customer_addresses WHERE id = ? AND customer_id = ?', [req.params.addrId, req.params.id]);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    await pool.query('DELETE FROM customer_addresses WHERE id = ?', [req.params.addrId]);
    const [remaining] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY id ASC', [req.params.id]);
    if (remaining.length && addr.is_default) {
      await pool.query('UPDATE customer_addresses SET is_default = 1 WHERE id = ?', [remaining[0].id]);
    }
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC', [req.params.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─── SECURITY ─────────────────────────────────────────────────────────────────
router.post('/:id/reset-password', authMiddleware, async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const tempPassword = crypto.randomBytes(5).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 10);
    await pool.query('UPDATE customers SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?', [hashed, req.params.id]);

    res.json({ success: true, tempPassword, message: `Password reset. Share with customer: ${tempPassword}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/send-activation', authMiddleware, async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT id, email FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const token = crypto.randomBytes(20).toString('hex');
    await pool.query('UPDATE customers SET activation_token = ?, is_activated = 0 WHERE id = ?', [token, req.params.id]);
    const activationLink = `${process.env.STOREFRONT_URL || 'http://localhost:3000'}/activate?token=${token}&email=${encodeURIComponent(customer.email)}`;
    res.json({ success: true, activationLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── MAIN CRUD ────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, group } = req.query;
    const conditions = [];
    const params = [];
    if (status) { conditions.push('status = ?');          params.push(status); }
    if (group)  { conditions.push('customer_group = ?');  params.push(group); }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [customers] = await pool.query(`SELECT * FROM customers ${where} ORDER BY created_at DESC`, params);
    res.json(customers.map(fmtCustomer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone = '', status = 'active', group = 'regular', groupDiscount = 0 } = req.body;
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, status, customer_group, group_discount) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, status, group, groupDiscount]
    );
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtCustomer(customer));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, status, group, groupDiscount } = req.body;
    const fields = {};
    if (name !== undefined)          fields.name           = name;
    if (email !== undefined)         fields.email          = email;
    if (phone !== undefined)         fields.phone          = phone;
    if (status !== undefined)        fields.status         = status;
    if (group !== undefined)         fields.customer_group = group;
    if (groupDiscount !== undefined) fields.group_discount = groupDiscount;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE customers SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(customer));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customerId = req.params.id;

    const [activeOrders] = await pool.query(
      `SELECT * FROM orders WHERE customer_id = ? AND status NOT IN (${FINAL_STATUSES.map(() => '?').join(',')})`,
      [customerId, ...FINAL_STATUSES]
    );

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let restoredItems = 0;
      for (const order of activeOrders) {
        const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        for (const item of items) {
          if (!item.product_id || !item.quantity) continue;
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
          restoredItems += item.quantity;
        }
        await conn.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);
      }

      await conn.query('DELETE FROM reviews WHERE customer_id = ?', [customerId]);
      const [[customer]] = await conn.query('SELECT id FROM customers WHERE id = ? LIMIT 1', [customerId]);
      if (!customer) {
        await conn.rollback();
        return res.status(404).json({ message: 'Customer not found' });
      }
      await conn.query('DELETE FROM customers WHERE id = ?', [customerId]);
      await conn.commit();

      res.json({ message: 'Customer deleted', restoredOrders: activeOrders.length, restoredItems });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ─── DETAILS ──────────────────────────────────────────────────────────────────
router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20', [req.params.id]
    );

    const [reviews] = await pool.query(
      `SELECT r.*, p.name AS product_name, p.thumbnail AS product_thumbnail
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id
       WHERE r.customer_id = ? ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    const [wishlist] = await pool.query(
      `SELECT p.id AS _id, p.name, p.thumbnail, p.regular_price AS regularPrice
       FROM customer_wishlist cw JOIN products p ON p.id = cw.product_id
       WHERE cw.customer_id = ?`,
      [req.params.id]
    );

    res.json({
      customer: { ...fmtCustomer(customer), wishlist },
      orders: orders.map(o => ({
        _id: o.id, orderNumber: o.order_number, status: o.status,
        paymentStatus: o.payment_status, total: o.total, createdAt: o.created_at,
      })),
      reviews: reviews.map(r => ({
        _id: r.id, rating: r.rating, comment: r.comment, status: r.status,
        productId: { _id: r.product_id, name: r.product_name, thumbnail: r.product_thumbnail },
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GROUP / POINTS / STATUS ──────────────────────────────────────────────────
router.patch('/:id/group', authMiddleware, async (req, res) => {
  try {
    const { group, groupDiscount } = req.body;
    const fields = { customer_group: group };
    if (groupDiscount !== undefined) fields.group_discount = groupDiscount;
    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE customers SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(customer));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/points', authMiddleware, async (req, res) => {
  try {
    const { type, points, description } = req.body;
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const pointsChange = type === 'redeemed' ? -Math.abs(points) : Math.abs(points);
    const newPoints    = Math.max(0, (customer.reward_points || 0) + pointsChange);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('UPDATE customers SET reward_points = ? WHERE id = ?', [newPoints, req.params.id]);
      if (type === 'redeemed') {
        await conn.query('UPDATE customers SET total_points_redeemed = total_points_redeemed + ? WHERE id = ?', [Math.abs(points), req.params.id]);
      } else {
        await conn.query('UPDATE customers SET total_points_earned = total_points_earned + ? WHERE id = ?', [Math.abs(points), req.params.id]);
      }
      await conn.query(
        'INSERT INTO customer_reward_history (customer_id, type, points, description) VALUES (?, ?, ?, ?)',
        [req.params.id, type, Math.abs(points), description || '']
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [[updated]] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(fmtCustomer(updated));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id/login-activity', authMiddleware, async (req, res) => {
  try {
    const [[customer]] = await pool.query(
      'SELECT last_login_date, last_login_ip FROM customers WHERE id = ? LIMIT 1', [req.params.id]
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [loginHistory] = await pool.query(
      'SELECT id, ip, device, created_at FROM customer_login_history WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.params.id]
    );

    res.json({ lastLoginDate: customer.last_login_date, lastLoginIp: customer.last_login_ip, loginHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, suspendedUntil } = req.body;
    const validStatuses = ['active', 'inactive', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const fields = { status };
    fields.suspended_until = suspendedUntil || null;
    await pool.query('UPDATE customers SET status = ?, suspended_until = ? WHERE id = ?', [status, fields.suspended_until, req.params.id]);
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(customer));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.post('/:id/notify', authMiddleware, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await pool.query(
      'INSERT INTO customer_notifications (customer_id, title, message, type) VALUES (?, ?, ?, ?)',
      [req.params.id, title, message, type]
    );
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-notify', authMiddleware, async (req, res) => {
  try {
    const { customerIds, title, message, type = 'info' } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });
    if (!Array.isArray(customerIds) || !customerIds.length) return res.status(400).json({ message: 'Customer IDs required' });
    for (const cid of customerIds) {
      await pool.query(
        'INSERT INTO customer_notifications (customer_id, title, message, type) VALUES (?, ?, ?, ?)',
        [cid, title, message, type]
      );
    }
    res.json({ success: true, sent: customerIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/notifications', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id AS _id, title, message, type, is_read AS `read`, created_at AS createdAt FROM customer_notifications WHERE customer_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
