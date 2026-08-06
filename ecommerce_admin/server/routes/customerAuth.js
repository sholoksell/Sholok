const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

let sendMail, renderOrderConfirmationHtml;
try {
  ({ sendMail, renderOrderConfirmationHtml } = require('../lib/mailer'));
} catch { /* mailer not configured */ }

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || 'sholok_customer_secret_key_2024';

const customerAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET);
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

function fmtCustomer(row) {
  if (!row) return null;
  return {
    _id:        row.id,
    name:       row.name,
    email:      row.email,
    phone:      row.phone,
    status:     row.status,
    group:      row.customer_group,
    totalOrders: row.total_orders,
    totalSpent:  row.total_spent,
    rewardPoints: row.reward_points,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [existing] = await pool.query('SELECT id FROM customers WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, password, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || '', hashedPassword, 'active']
    );

    const customerId = result.insertId;
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    const customer = rows[0];

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      CUSTOMER_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const customer = rows[0];

    if (customer.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }
    if (!customer.password) {
      return res.status(400).json({ message: 'No password set. Please register again.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await pool.query('UPDATE customers SET last_login_date = NOW() WHERE id = ?', [customer.id]);

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      CUSTOMER_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current customer profile
router.get('/me', customerAuthMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, status, customer_group, total_orders, total_spent, reward_points, created_at, updated_at FROM customers WHERE id = ? LIMIT 1',
      [req.customer.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', customerAuthMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query('UPDATE customers SET name = ?, phone = ? WHERE id = ?', [name, phone, req.customer.id]);
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, status, customer_group, total_orders, total_spent, reward_points FROM customers WHERE id = ?',
      [req.customer.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ORDER ROUTES (customer-facing) ──────────────────────────────────────────

function fmtOrder(row, items) {
  return {
    _id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotal: row.subtotal,
    shipping: row.shipping,
    tax: row.tax,
    discount: row.discount,
    total: row.total,
    shippingAddress: {
      name: row.shipping_name,
      phone: row.shipping_phone,
      street: row.shipping_street,
      city: row.shipping_city,
      state: row.shipping_state,
      zipCode: row.shipping_zip_code,
      country: row.shipping_country,
    },
    trackingNumber: row.tracking_number,
    courierName: row.courier_name,
    notes: row.notes,
    items: items || [],
    deliveredAt: row.delivered_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /customer-auth/orders
router.get('/orders', customerAuthMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [req.customer.id]
    );

    const result = [];
    for (const o of orders) {
      const [items] = await pool.query(
        'SELECT oi.*, p.thumbnail AS product_thumbnail FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?',
        [o.id]
      );
      result.push(fmtOrder(o, items.map(it => ({
        _id: it.id,
        productId: { _id: it.product_id, name: it.product_name, thumbnail: it.product_image || it.product_thumbnail, images: it.product_image ? [it.product_image] : [] },
        productName: it.product_name,
        quantity: it.quantity,
        price: it.price,
        total: it.total,
      }))));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /customer-auth/orders — place a new order
router.post('/orders', customerAuthMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress = {}, paymentMethod, subtotal, shippingCost, total, couponCode, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const paymentMap = { cod: 'cash_on_delivery', online: 'credit_card' };
    const mappedPayment = paymentMap[paymentMethod] || 'cash_on_delivery';

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Reduce stock
      for (const item of items) {
        await conn.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.productId]);
      }

      // Generate order number
      const [[{ cnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM orders');
      const orderNumber = `ORD-${String(cnt + 1).padStart(5, '0')}`;

      const [result] = await conn.query(
        `INSERT INTO orders
         (order_number, customer_id, subtotal, shipping, tax, discount, total,
          payment_method, status, payment_status,
          shipping_name, shipping_phone, shipping_street, shipping_city,
          shipping_state, shipping_zip_code, shipping_country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, req.customer.id, subtotal || 0, shippingCost || 0, 0, discount || 0, total || 0,
          mappedPayment,
          shippingAddress.name || '', shippingAddress.phone || '', shippingAddress.street || '',
          shippingAddress.city || '', shippingAddress.state || '', shippingAddress.zipCode || '',
          shippingAddress.country || '',
        ]
      );

      const orderId = result.insertId;

      for (const item of items) {
        // Resolve vendor_id from product table so multi-vendor orders are correctly attributed
        const [[prod]] = await conn.query('SELECT vendor_id, ownership_type, regular_price, sale_price FROM products WHERE id = ? LIMIT 1', [item.productId]).catch(() => [[null]]);
        const vendorId = prod?.vendor_id || null;
        const vendorName = vendorId
          ? (await conn.query('SELECT store_name FROM vendors WHERE id = ? LIMIT 1', [vendorId]).then(([r]) => r[0]?.store_name).catch(() => null))
          : null;

        // Determine effective price: check for active flash sale first
        let effectivePrice = Number(item.price);
        try {
          const [[flashItem]] = await conn.query(
            `SELECT fsp.discount_type, fsp.discount_value, fs.start_time, fs.end_time
             FROM flash_sale_products fsp
             JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
             WHERE fsp.product_id = ? AND fs.is_active = 1
               AND fs.start_time <= NOW() AND fs.end_time >= NOW()
             LIMIT 1`,
            [item.productId]
          );
          if (flashItem) {
            const basePrice = Number(prod?.sale_price || prod?.regular_price || item.price);
            const flashPrice = flashItem.discount_type === 'percentage'
              ? basePrice * (1 - Number(flashItem.discount_value) / 100)
              : basePrice - Number(flashItem.discount_value);
            effectivePrice = Math.min(effectivePrice, Math.max(0, flashPrice));
          }
        } catch { /* if flash tables don't exist, use sent price */ }

        await conn.query(
          'INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, total, vendor_id, vendor_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.productId, item.productName || item.name || '', item.image || '', item.quantity, effectivePrice, effectivePrice * item.quantity, vendorId, vendorName]
        );

        // Credit vendor wallet (pending settlement)
        if (vendorId) {
          const itemTotal = item.total || item.price * item.quantity;
          await conn.query(
            'UPDATE vendor_wallets SET pending_settlement = pending_settlement + ? WHERE vendor_id = ?',
            [itemTotal, vendorId]
          ).catch(() => {});
          await conn.query(
            "INSERT INTO vendor_notifications (vendor_id, title, message, type) VALUES (?, ?, ?, 'order')",
            [vendorId, 'New Order Received', `Order #${orderNumber} contains your product: ${item.productName || item.name}`]
          ).catch(() => {});
        }
      }

      // Increment coupon usage
      if (couponCode) {
        await conn.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [couponCode.toUpperCase()]).catch(() => {});
      }

      // Update customer stats
      await conn.query(
        'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?',
        [total || 0, req.customer.id]
      );

      await conn.commit();

      const [[savedOrder]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const [savedItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

      const response = fmtOrder(savedOrder, savedItems.map(it => ({
        _id: it.id, productId: it.product_id, productName: it.product_name,
        quantity: it.quantity, price: it.price, total: it.total,
      })));

      // Fire-and-forget confirmation email
      if (sendMail && renderOrderConfirmationHtml) {
        (async () => {
          try {
            const [[cust]] = await pool.query('SELECT name, email FROM customers WHERE id = ?', [req.customer.id]);
            if (cust?.email) {
              await sendMail({
                to: cust.email,
                subject: `Order Confirmation - ${orderNumber}`,
                html: renderOrderConfirmationHtml({ customerName: cust.name, order: response }),
              });
            }
          } catch (mailErr) {
            console.error('[orders] confirmation email failed:', mailErr.message);
          }
        })();
      }

      res.status(201).json(response);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /customer-auth/orders/:id/cancel
router.put('/orders/:id/cancel', customerAuthMiddleware, async (req, res) => {
  try {
    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ? LIMIT 1',
      [req.params.id, req.customer.id]
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order cannot be cancelled' });
    }

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const item of items) {
        await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
      await conn.query("UPDATE orders SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?", [order.id]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [[updated]] = await pool.query('SELECT * FROM orders WHERE id = ?', [order.id]);
    res.json(fmtOrder(updated, items));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

router.get('/notifications', customerAuthMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id AS _id, title, message, type, is_read AS `read`, created_at AS createdAt FROM customer_notifications WHERE customer_id = ? ORDER BY created_at DESC',
      [req.customer.id]
    );
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/notifications/read-all', customerAuthMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE customer_notifications SET is_read = 1 WHERE customer_id = ?', [req.customer.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/notifications/:notifId/read', customerAuthMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE customer_notifications SET is_read = 1 WHERE id = ? AND customer_id = ?',
      [req.params.notifId, req.customer.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PROFILE / PASSWORD ───────────────────────────────────────────────────────

router.put('/address', customerAuthMiddleware, async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;
    // Store as the first default address
    const [existing] = await pool.query(
      'SELECT id FROM customer_addresses WHERE customer_id = ? AND is_default = 1 LIMIT 1',
      [req.customer.id]
    );
    if (existing.length) {
      await pool.query(
        'UPDATE customer_addresses SET street = ?, city = ?, state = ?, zip_code = ?, country = ? WHERE id = ?',
        [street, city, state, zipCode, country, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO customer_addresses (customer_id, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [req.customer.id, street, city, state, zipCode, country]
      );
    }
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.customer.id]);
    res.json(fmtCustomer(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/change-password', customerAuthMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [req.customer.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE customers SET password = ? WHERE id = ?', [hashed, customer.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADDRESS BOOK ─────────────────────────────────────────────────────────────

function fmtAddr(row) {
  return {
    _id: row.id, label: row.label, name: row.name, phone: row.phone,
    street: row.street, city: row.city, state: row.state,
    zipCode: row.zip_code, country: row.country,
    type: row.type, isDefault: !!row.is_default,
  };
}

router.get('/addresses', customerAuthMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC',
      [req.customer.id]
    );
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/addresses', customerAuthMiddleware, async (req, res) => {
  try {
    const { label, name, phone, street, city, state, zipCode, country, type, isDefault } = req.body;
    if (isDefault) {
      await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.customer.id]);
    }
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM customer_addresses WHERE customer_id = ?', [req.customer.id]);
    const makeDefault = isDefault || cnt === 0 ? 1 : 0;
    await pool.query(
      'INSERT INTO customer_addresses (customer_id, label, name, phone, street, city, state, zip_code, country, type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.customer.id, label || 'Home', name || '', phone || '', street || '', city || '', state || '', zipCode || '', country || '', type || 'both', makeDefault]
    );
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC', [req.customer.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/addresses/:addrId', customerAuthMiddleware, async (req, res) => {
  try {
    const { label, name, phone, street, city, state, zipCode, country, type, isDefault } = req.body;
    if (isDefault) {
      await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.customer.id]);
    }
    await pool.query(
      'UPDATE customer_addresses SET label = ?, name = ?, phone = ?, street = ?, city = ?, state = ?, zip_code = ?, country = ?, type = ?, is_default = ? WHERE id = ? AND customer_id = ?',
      [label || 'Home', name || '', phone || '', street || '', city || '', state || '', zipCode || '', country || '', type || 'both', isDefault ? 1 : 0, req.params.addrId, req.customer.id]
    );
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC', [req.customer.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/addresses/:addrId', customerAuthMiddleware, async (req, res) => {
  try {
    const [[addr]] = await pool.query('SELECT * FROM customer_addresses WHERE id = ? AND customer_id = ?', [req.params.addrId, req.customer.id]);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    await pool.query('DELETE FROM customer_addresses WHERE id = ?', [req.params.addrId]);
    // Ensure at least one default remains
    const [remaining] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY id ASC', [req.customer.id]);
    if (remaining.length && addr.is_default) {
      await pool.query('UPDATE customer_addresses SET is_default = 1 WHERE id = ?', [remaining[0].id]);
    }
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC', [req.customer.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/addresses/:addrId/set-default', customerAuthMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.customer.id]);
    await pool.query('UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND customer_id = ?', [req.params.addrId, req.customer.id]);
    const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC', [req.customer.id]);
    res.json(rows.map(fmtAddr));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── REWARDS ─────────────────────────────────────────────────────────────────

router.get('/rewards', customerAuthMiddleware, async (req, res) => {
  try {
    const [[customer]] = await pool.query(
      'SELECT reward_points, total_points_earned, total_points_redeemed, customer_group, group_discount FROM customers WHERE id = ? LIMIT 1',
      [req.customer.id]
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [pointsHistory] = await pool.query(
      'SELECT id AS _id, type, points, description, created_at AS date FROM customer_reward_history WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.customer.id]
    );

    res.json({
      rewardPoints:         customer.reward_points || 0,
      totalPointsEarned:    customer.total_points_earned || 0,
      totalPointsRedeemed:  customer.total_points_redeemed || 0,
      pointsHistory,
      group:         customer.customer_group,
      groupDiscount: customer.group_discount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
