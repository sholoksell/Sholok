const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function fmt(r) {
  return {
    _id: r.id, shipmentNumber: r.shipment_number, orderId: r.order_id,
    sourceType: r.source_type, sourceId: r.source_id, sourceLabel: r.source_label,
    status: r.status, courierId: r.courier_id, courierName: r.courier_name,
    trackingNumber: r.tracking_number, dispatchDate: r.dispatch_date,
    estimatedDeliveryDate: r.estimated_delivery_date,
    estimatedDaysMin: r.estimated_days_min, estimatedDaysMax: r.estimated_days_max,
    totalWeightKg: r.total_weight_kg ? Number(r.total_weight_kg) : null,
    deliveryCharge: Number(r.delivery_charge || 0),
    deliveryDate: r.delivery_date, deliverySlotId: r.delivery_slot_id,
    notes: r.notes, deliveredAt: r.delivered_at, cancelledAt: r.cancelled_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function genShipmentNumber() {
  return 'SH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// GET /api/shipments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { order_id, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = '1=1';
    const params = [];
    if (order_id) { where += ' AND s.order_id=?'; params.push(order_id); }
    if (status) { where += ' AND s.status=?'; params.push(status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM shipments s WHERE ${where}`, params);
    const [rows] = await pool.query(
      `SELECT s.* FROM shipments s WHERE ${where} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const shipments = await Promise.all(rows.map(async r => {
      const [items] = await pool.query('SELECT * FROM shipment_items WHERE shipment_id=?', [r.id]);
      return { ...fmt(r), items };
    }));
    res.json({ shipments, total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/shipments/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM shipments WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    const [items] = await pool.query('SELECT * FROM shipment_items WHERE shipment_id=?', [row.id]);
    const [events] = await pool.query('SELECT * FROM shipment_tracking_events WHERE shipment_id=? ORDER BY created_at ASC', [row.id]);
    res.json({ ...fmt(row), items, trackingEvents: events });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/shipments/order/:orderId — all shipments for an order (used by frontend)
router.get('/order/:orderId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shipments WHERE order_id=? ORDER BY created_at ASC', [req.params.orderId]);
    const shipments = await Promise.all(rows.map(async r => {
      const [items] = await pool.query('SELECT * FROM shipment_items WHERE shipment_id=?', [r.id]);
      const [events] = await pool.query('SELECT * FROM shipment_tracking_events WHERE shipment_id=? ORDER BY created_at ASC', [r.id]);
      return { ...fmt(r), items, trackingEvents: events };
    }));
    res.json(shipments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/shipments — create shipment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      order_id, source_type = 'sholok', source_id, source_label,
      courier_id, courier_name, tracking_number,
      dispatch_date, estimated_delivery_date, estimated_days_min, estimated_days_max,
      total_weight_kg, delivery_charge = 0,
      delivery_date, delivery_slot_id, notes, items = []
    } = req.body;
    if (!order_id) return res.status(400).json({ message: 'order_id required' });
    const shipmentNumber = genShipmentNumber();
    const [r] = await pool.query(
      `INSERT INTO shipments (shipment_number, order_id, source_type, source_id, source_label, courier_id, courier_name, tracking_number, dispatch_date, estimated_delivery_date, estimated_days_min, estimated_days_max, total_weight_kg, delivery_charge, delivery_date, delivery_slot_id, notes, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      [shipmentNumber, order_id, source_type, source_id || null, source_label || null, courier_id || null, courier_name || null, tracking_number || null, dispatch_date || null, estimated_delivery_date || null, estimated_days_min || null, estimated_days_max || null, total_weight_kg || null, delivery_charge, delivery_date || null, delivery_slot_id || null, notes || null]
    );
    const shipmentId = r.insertId;
    for (const item of items) {
      await pool.query('INSERT INTO shipment_items (shipment_id, order_item_id, product_id, product_name, quantity, weight_kg) VALUES (?,?,?,?,?,?)',
        [shipmentId, item.order_item_id || null, item.product_id || null, item.product_name || null, item.quantity || 1, item.weight_kg || 0.5]);
    }
    await pool.query('INSERT INTO shipment_tracking_events (shipment_id, status, description) VALUES (?,?,?)',
      [shipmentId, 'pending', 'Shipment created']);
    const [[created]] = await pool.query('SELECT * FROM shipments WHERE id=?', [shipmentId]);
    res.status(201).json(fmt(created));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/shipments/:id/status — update status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, description, location, tracking_number, courier_id, courier_name } = req.body;
    if (!status) return res.status(400).json({ message: 'status required' });
    const updates = { status };
    if (tracking_number) updates.tracking_number = tracking_number;
    if (courier_id) updates.courier_id = courier_id;
    if (courier_name) updates.courier_name = courier_name;
    if (status === 'delivered') updates.delivered_at = new Date();
    if (status === 'cancelled') updates.cancelled_at = new Date();
    const setClauses = Object.keys(updates).map(k => `${k}=?`).join(', ');
    await pool.query(`UPDATE shipments SET ${setClauses} WHERE id=?`, [...Object.values(updates), req.params.id]);
    await pool.query('INSERT INTO shipment_tracking_events (shipment_id, status, description, location, created_by) VALUES (?,?,?,?,?)',
      [req.params.id, status, description || null, location || null, req.user?.id]);
    res.json({ message: 'Status updated', status });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/shipments/:id — general update (courier, tracking, dates)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { courier_id, courier_name, tracking_number, dispatch_date, estimated_delivery_date, estimated_days_min, estimated_days_max, total_weight_kg, delivery_charge, notes } = req.body;
    await pool.query(
      `UPDATE shipments SET courier_id=COALESCE(?,courier_id), courier_name=COALESCE(?,courier_name), tracking_number=COALESCE(?,tracking_number),
       dispatch_date=COALESCE(?,dispatch_date), estimated_delivery_date=COALESCE(?,estimated_delivery_date),
       estimated_days_min=COALESCE(?,estimated_days_min), estimated_days_max=COALESCE(?,estimated_days_max),
       total_weight_kg=COALESCE(?,total_weight_kg), delivery_charge=COALESCE(?,delivery_charge), notes=COALESCE(?,notes) WHERE id=?`,
      [courier_id, courier_name, tracking_number, dispatch_date, estimated_delivery_date, estimated_days_min, estimated_days_max, total_weight_kg, delivery_charge, notes, req.params.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM shipments WHERE id=?', [req.params.id]);
    res.json(fmt(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/shipments/:id/split — split shipment into two
router.post('/:id/split', authMiddleware, async (req, res) => {
  try {
    const { item_ids } = req.body;
    if (!item_ids || !item_ids.length) return res.status(400).json({ message: 'item_ids required' });
    const [[orig]] = await pool.query('SELECT * FROM shipments WHERE id=?', [req.params.id]);
    if (!orig) return res.status(404).json({ message: 'Shipment not found' });
    const newNumber = genShipmentNumber();
    const [r] = await pool.query(
      `INSERT INTO shipments (shipment_number, order_id, source_type, source_id, source_label, status) VALUES (?,?,?,?,?,'pending')`,
      [newNumber, orig.order_id, orig.source_type, orig.source_id, orig.source_label]
    );
    const newId = r.insertId;
    await pool.query(`UPDATE shipment_items SET shipment_id=? WHERE id IN (${item_ids.map(() => '?').join(',')})`, [newId, ...item_ids]);
    await pool.query('INSERT INTO shipment_tracking_events (shipment_id, status, description) VALUES (?,?,?)', [newId, 'pending', `Split from shipment #${orig.shipment_number}`]);
    res.json({ message: 'Split successful', newShipmentId: newId, newShipmentNumber: newNumber });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/shipments/merge — merge multiple shipments
router.post('/merge', authMiddleware, async (req, res) => {
  try {
    const { shipment_ids } = req.body;
    if (!shipment_ids || shipment_ids.length < 2) return res.status(400).json({ message: 'At least 2 shipment_ids required' });
    const [primary] = shipment_ids;
    const rest = shipment_ids.slice(1);
    await pool.query(`UPDATE shipment_items SET shipment_id=? WHERE shipment_id IN (${rest.map(() => '?').join(',')})`, [primary, ...rest]);
    await pool.query(`UPDATE shipments SET status='cancelled', cancelled_at=NOW() WHERE id IN (${rest.map(() => '?').join(',')})`, rest);
    await pool.query('INSERT INTO shipment_tracking_events (shipment_id, status, description) VALUES (?,?,?)',
      [primary, 'pending', `Merged shipments: ${rest.join(', ')}`]);
    res.json({ message: 'Merge successful', primaryShipmentId: primary });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
