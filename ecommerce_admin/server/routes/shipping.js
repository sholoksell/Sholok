const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

/* ─────────────────────────── formatters ─────────────────────────── */

function fmtArea(row, postalCodes = []) {
  return {
    _id:                   row.id,
    name:                  row.name,
    city:                  row.city,
    state:                 row.state,
    country:               row.country,
    deliveryCharge:        row.delivery_charge,
    freeDeliveryThreshold: row.free_delivery_threshold,
    estimatedDeliveryDays: row.estimated_delivery_days,
    isActive:              !!row.is_active,
    postalCodes:           postalCodes.map(pc => pc.postal_code),
    createdAt:             row.created_at,
    updatedAt:             row.updated_at,
  };
}

function fmtMethod(row) {
  return {
    _id:          row.id,
    name:         row.name,
    type:         row.type,
    price:        Number(row.price),
    baseCharge:   Number(row.price),
    freeThreshold: 0,
    description:  row.description,
    icon:         row.icon,
    deliveryDays: row.delivery_days,
    isActive:     !!row.is_active,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

function fmtShippingOrder(row) {
  return {
    _id:         row.id,
    orderNumber: row.order_number,
    customerId:  { _id: row.customer_id, name: row.customer_name, email: row.customer_email, phone: row.customer_phone },
    status:      row.status,
    total:       row.total,
    shippingAddress: {
      name:    row.shipping_name,
      phone:   row.shipping_phone,
      street:  row.shipping_street,
      city:    row.shipping_city,
      state:   row.shipping_state,
      zipCode: row.shipping_zip_code,
      country: row.shipping_country,
    },
    trackingNumber:        row.tracking_number,
    courierName:           row.courier_name,
    estimatedDeliveryDate: row.estimated_delivery_date,
    shippingMethod:        row.shipping_method,
    deliveredAt:           row.delivered_at,
    createdAt:             row.created_at,
  };
}

async function fetchAreaFull(id) {
  const [[row]] = await pool.query('SELECT * FROM delivery_areas WHERE id = ? LIMIT 1', [id]);
  if (!row) return null;
  const [pcs] = await pool.query('SELECT postal_code FROM delivery_area_postal_codes WHERE delivery_area_id = ?', [id]);
  return fmtArea(row, pcs);
}

/* ─────────────────────── DELIVERY AREAS ─────────────────────────── */

// GET /areas
router.get('/areas', async (req, res) => {
  try {
    const { active } = req.query;
    const where = active === 'true' ? 'WHERE is_active = 1' : '';
    const [rows] = await pool.query(`SELECT * FROM delivery_areas ${where} ORDER BY name ASC`);

    const areas = [];
    for (const row of rows) {
      const [pcs] = await pool.query('SELECT postal_code FROM delivery_area_postal_codes WHERE delivery_area_id = ?', [row.id]);
      areas.push(fmtArea(row, pcs));
    }
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /areas/:id
router.get('/areas/:id', async (req, res) => {
  try {
    const area = await fetchAreaFull(req.params.id);
    if (!area) return res.status(404).json({ message: 'Delivery area not found' });
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /areas
router.post('/areas', authMiddleware, async (req, res) => {
  try {
    const {
      name, city = '', state = '', country = 'Bangladesh',
      deliveryCharge = 0, freeDeliveryThreshold = 0,
      estimatedDeliveryDays = 3, isActive = true, postalCodes = [],
    } = req.body;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO delivery_areas (name, city, state, country, delivery_charge, free_delivery_threshold, estimated_delivery_days, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, city, state, country, deliveryCharge, freeDeliveryThreshold, estimatedDeliveryDays, isActive ? 1 : 0]
      );
      const areaId = result.insertId;

      if (postalCodes.length) {
        const vals = postalCodes.map(pc => [areaId, pc]);
        await conn.query('INSERT INTO delivery_area_postal_codes (delivery_area_id, postal_code) VALUES ?', [vals]);
      }

      await conn.commit();
      const area = await fetchAreaFull(areaId);
      res.status(201).json(area);
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

// PUT /areas/:id
router.put('/areas/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name, city, state, country, deliveryCharge,
      freeDeliveryThreshold, estimatedDeliveryDays, isActive, postalCodes,
    } = req.body;

    const fields = {};
    if (name !== undefined)                  fields.name                      = name;
    if (city !== undefined)                  fields.city                      = city;
    if (state !== undefined)                 fields.state                     = state;
    if (country !== undefined)               fields.country                   = country;
    if (deliveryCharge !== undefined)        fields.delivery_charge           = deliveryCharge;
    if (freeDeliveryThreshold !== undefined) fields.free_delivery_threshold   = freeDeliveryThreshold;
    if (estimatedDeliveryDays !== undefined) fields.estimated_delivery_days   = estimatedDeliveryDays;
    if (isActive !== undefined)              fields.is_active                 = isActive ? 1 : 0;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (Object.keys(fields).length) {
        const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        await conn.query(`UPDATE delivery_areas SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
      }

      if (Array.isArray(postalCodes)) {
        await conn.query('DELETE FROM delivery_area_postal_codes WHERE delivery_area_id = ?', [req.params.id]);
        if (postalCodes.length) {
          const vals = postalCodes.map(pc => [req.params.id, pc]);
          await conn.query('INSERT INTO delivery_area_postal_codes (delivery_area_id, postal_code) VALUES ?', [vals]);
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const area = await fetchAreaFull(req.params.id);
    if (!area) return res.status(404).json({ message: 'Delivery area not found' });
    res.json(area);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /areas/:id
router.delete('/areas/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM delivery_areas WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Delivery area not found' });
    await pool.query('DELETE FROM delivery_areas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Delivery area deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /check — check delivery availability for a postal code
router.post('/check', async (req, res) => {
  try {
    const { postalCode } = req.body;
    if (!postalCode) return res.status(400).json({ message: 'postalCode required' });

    const [rows] = await pool.query(
      `SELECT da.*, dap.postal_code
       FROM delivery_area_postal_codes dap
       JOIN delivery_areas da ON da.id = dap.delivery_area_id
       WHERE dap.postal_code = ? AND da.is_active = 1
       LIMIT 1`,
      [postalCode]
    );

    if (!rows.length) {
      return res.json({ available: false, message: 'Delivery not available for this area' });
    }
    const area = rows[0];
    res.json({
      available:             true,
      areaId:                area.id,
      name:                  area.name,
      deliveryCharge:        area.delivery_charge,
      freeDeliveryThreshold: area.free_delivery_threshold,
      estimatedDeliveryDays: area.estimated_delivery_days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── SHIPPING METHODS ────────────────────────── */

// GET /methods
router.get('/methods', async (req, res) => {
  try {
    const { active } = req.query;
    const where = active === 'true' ? 'WHERE is_active = 1' : '';
    const [rows] = await pool.query(`SELECT * FROM shipping_methods ${where} ORDER BY price ASC`);
    res.json(rows.map(fmtMethod));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /methods/:id
router.get('/methods/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM shipping_methods WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Shipping method not found' });
    res.json(fmtMethod(row));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /methods
router.post('/methods', authMiddleware, async (req, res) => {
  try {
    const {
      name, type = 'flat', description = '',
      icon = '', deliveryDays = 3, isActive = true,
    } = req.body;
    const price = req.body.price ?? req.body.baseCharge ?? 0;

    const [result] = await pool.query(
      'INSERT INTO shipping_methods (name, type, price, description, icon, delivery_days, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, price, description, icon, deliveryDays, isActive ? 1 : 0]
    );
    const [[saved]] = await pool.query('SELECT * FROM shipping_methods WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtMethod(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /methods/:id
router.put('/methods/:id', authMiddleware, async (req, res) => {
  try {
    const { name, type, description, icon, deliveryDays, isActive } = req.body;
    const priceVal = req.body.price ?? req.body.baseCharge;
    const fields = {};
    if (name !== undefined)         fields.name          = name;
    if (type !== undefined)         fields.type          = type;
    if (priceVal !== undefined)     fields.price         = priceVal;
    if (description !== undefined)  fields.description   = description;
    if (icon !== undefined)         fields.icon          = icon;
    if (deliveryDays !== undefined)  fields.delivery_days = deliveryDays;
    if (isActive !== undefined)     fields.is_active     = isActive ? 1 : 0;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE shipping_methods SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const [[saved]] = await pool.query('SELECT * FROM shipping_methods WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Shipping method not found' });
    res.json(fmtMethod(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /methods/:id
router.delete('/methods/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM shipping_methods WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Shipping method not found' });
    await pool.query('DELETE FROM shipping_methods WHERE id = ?', [req.params.id]);
    res.json({ message: 'Shipping method deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── SHIPPING SETTINGS OVERVIEW ─────────────── */

router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM shipping_methods ORDER BY price ASC');
    const [areas]   = await pool.query('SELECT * FROM delivery_areas ORDER BY name ASC');
    const areasWithPCs = [];
    for (const area of areas) {
      const [pcs] = await pool.query('SELECT postal_code FROM delivery_area_postal_codes WHERE delivery_area_id = ?', [area.id]);
      areasWithPCs.push(fmtArea(area, pcs));
    }
    res.json({ methods: methods.map(fmtMethod), deliveryAreas: areasWithPCs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────── SHIPPING STATS ─────────────────────────────── */

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ totalAreas }]]   = await pool.query('SELECT COUNT(*) AS totalAreas FROM delivery_areas');
    const [[{ activeAreas }]]  = await pool.query('SELECT COUNT(*) AS activeAreas FROM delivery_areas WHERE is_active = 1');
    const [[{ shippedOrders }]]    = await pool.query("SELECT COUNT(*) AS shippedOrders FROM orders WHERE status = 'shipped'");
    const [[{ deliveredOrders }]]  = await pool.query("SELECT COUNT(*) AS deliveredOrders FROM orders WHERE status = 'delivered'");
    const [[{ outForDelivery }]]   = await pool.query("SELECT COUNT(*) AS outForDelivery FROM orders WHERE status = 'out_for_delivery'");
    const [[{ pendingShipment }]]  = await pool.query("SELECT COUNT(*) AS pendingShipment FROM orders WHERE status IN ('pending','confirmed','processing')");
    const [[{ totalShippingRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(shipping + delivery_charge), 0) AS totalShippingRevenue FROM orders WHERE status = 'delivered'"
    );

    res.json({
      totalAreas:           Number(totalAreas),
      activeAreas:          Number(activeAreas),
      shippedOrders:        Number(shippedOrders),
      deliveredOrders:      Number(deliveredOrders),
      outForDelivery:       Number(outForDelivery),
      pendingShipment:      Number(pendingShipment),
      totalShippingRevenue: Number(totalShippingRevenue),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────── ORDERS (shipping view) ─────────────────────── */

// GET /orders
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const validStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

    let where = '';
    const params = [];
    if (status && status !== 'all') {
      where = 'WHERE o.status = ?';
      params.push(status);
    } else {
      const placeholders = validStatuses.map(() => '?').join(',');
      where = `WHERE o.status IN (${placeholders})`;
      params.push(...validStatuses);
    }

    const [orders] = await pool.query(
      `SELECT o.*,
              c.name  AS customer_name,
              c.email AS customer_email,
              c.phone AS customer_phone
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY o.created_at DESC LIMIT 100`,
      params
    );
    res.json(orders.map(fmtShippingOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /orders/:id/status
router.patch('/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber, courierName, estimatedDeliveryDate, note } = req.body;

    const fields = { status };
    if (trackingNumber)         fields.tracking_number          = trackingNumber;
    if (courierName)            fields.courier_name              = courierName;
    if (estimatedDeliveryDate)  fields.estimated_delivery_date   = new Date(estimatedDeliveryDate);
    if (status === 'delivered') fields.delivered_at              = new Date();

    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE orders SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);

    if (note) {
      await pool.query(
        'INSERT INTO order_status_history (order_id, status, note, updated_at) VALUES (?, ?, ?, NOW())',
        [req.params.id, status, note]
      );
    }

    const [[order]] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(fmtShippingOrder(order));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ─────────────────── EXPORT CSV ────────────────────────────────── */

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.status IN ('shipped','out_for_delivery','delivered')
       ORDER BY o.created_at DESC`
    );

    const rows = [['Order #', 'Customer', 'Phone', 'City', 'Address', 'Courier', 'Tracking #', 'Status', 'Date']];
    orders.forEach(o => {
      rows.push([
        o.order_number        || '',
        o.customer_name       || '',
        o.customer_phone      || o.shipping_phone || '',
        o.shipping_city       || '',
        o.shipping_street     || '',
        o.courier_name        || '',
        o.tracking_number     || '',
        o.status,
        new Date(o.created_at).toISOString().split('T')[0],
      ]);
    });

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="shipping.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
