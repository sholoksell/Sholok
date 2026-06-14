const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');

// DeliveryArea schema (shared with main server)
let DeliveryArea;
try {
  DeliveryArea = mongoose.model('DeliveryArea');
} catch {
  const deliveryAreaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    postalCodes: [{ type: String }],
    deliveryCharge: { type: Number, required: true, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    estimatedDeliveryDays: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });
  DeliveryArea = mongoose.model('DeliveryArea', deliveryAreaSchema);
}

// Get all delivery areas
router.get('/areas', authMiddleware, async (req, res) => {
  try {
    const areas = await DeliveryArea.find().sort({ city: 1 });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create delivery area
router.post('/areas', authMiddleware, async (req, res) => {
  try {
    const area = new DeliveryArea(req.body);
    await area.save();
    res.status(201).json(area);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update delivery area
router.put('/areas/:id', authMiddleware, async (req, res) => {
  try {
    const area = await DeliveryArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) return res.status(404).json({ message: 'Delivery area not found' });
    res.json(area);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete delivery area
router.delete('/areas/:id', authMiddleware, async (req, res) => {
  try {
    const area = await DeliveryArea.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ message: 'Delivery area not found' });
    res.json({ message: 'Delivery area deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get shipping stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalAreas = await DeliveryArea.countDocuments();
    const activeAreas = await DeliveryArea.countDocuments({ isActive: true });

    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const outForDelivery = await Order.countDocuments({ status: 'out_for_delivery' });
    const pendingShipment = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } });

    const totalShippingRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$shipping', '$deliveryCharge'] } } } },
    ]);

    res.json({
      totalAreas,
      activeAreas,
      shippedOrders,
      deliveredOrders,
      outForDelivery,
      pendingShipment,
      totalShippingRevenue: totalShippingRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by shipping status
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    } else {
      filter.status = { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] };
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order shipping status
router.patch('/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber, courierName, estimatedDeliveryDate, note } = req.body;
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (courierName) updateData.courierName = courierName;
    if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (status === 'delivered') updateData.deliveredAt = new Date();

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    Object.assign(order, updateData);
    if (note) {
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status, updatedAt: new Date(), note });
    }
    await order.save();
    await order.populate('customerId', 'name email phone');
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─── Shipping Methods ─────────────────────────────────────────────────────────
let ShippingMethod;
try {
  ShippingMethod = require('mongoose').model('ShippingMethod');
} catch {
  const shippingMethodSchema = new require('mongoose').Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['flat', 'weight', 'free', 'cod', 'express'], default: 'flat' },
    price: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    deliveryDays: { type: String, default: '3-5' },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });
  ShippingMethod = require('mongoose').model('ShippingMethod', shippingMethodSchema);
}

router.get('/methods', authMiddleware, async (req, res) => {
  try {
    const methods = await ShippingMethod.find().sort({ name: 1 });
    res.json(methods);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/methods', authMiddleware, async (req, res) => {
  try {
    const method = new ShippingMethod(req.body);
    await method.save();
    res.status(201).json(method);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/methods/:id', authMiddleware, async (req, res) => {
  try {
    const method = await ShippingMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!method) return res.status(404).json({ message: 'Not found' });
    res.json(method);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/methods/:id', authMiddleware, async (req, res) => {
  try {
    await ShippingMethod.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Export shipping CSV
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['shipped', 'out_for_delivery', 'delivered'] }
    }).populate('customerId', 'name email phone').sort({ createdAt: -1 });
    const rows = [['Order #', 'Customer', 'Phone', 'City', 'Address', 'Courier', 'Tracking #', 'Status', 'Date']];
    orders.forEach(o => {
      rows.push([
        o.orderNumber,
        o.customerId?.name || '',
        o.customerId?.phone || o.shippingAddress?.phone || '',
        o.shippingAddress?.city || o.deliveryAddress?.city || '',
        o.shippingAddress?.street || o.deliveryAddress?.addressLine1 || '',
        o.courierName || '',
        o.trackingNumber || '',
        o.status,
        new Date(o.createdAt).toISOString().split('T')[0],
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="shipping.csv"');
    res.send(csv);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
