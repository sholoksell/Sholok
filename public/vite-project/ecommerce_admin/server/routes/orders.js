const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Helper to normalize order data (customer orders use different field names)
function normalizeOrder(order) {
  const obj = order.toObject ? order.toObject() : { ...order };

  // Map deliveryAddress → shippingAddress if shippingAddress is missing
  if (!obj.shippingAddress && obj.deliveryAddress) {
    obj.shippingAddress = {
      name: obj.deliveryAddress.fullName || '',
      phone: obj.deliveryAddress.phone || '',
      street: [obj.deliveryAddress.addressLine1, obj.deliveryAddress.addressLine2].filter(Boolean).join(', ') || '',
      city: obj.deliveryAddress.city || '',
      state: obj.deliveryAddress.area || '',
      zipCode: obj.deliveryAddress.postalCode || '',
      country: 'Bangladesh',
    };
  }

  // Ensure shippingAddress exists
  if (!obj.shippingAddress) {
    obj.shippingAddress = { name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '' };
  }

  // Map deliveryCharge → shipping if shipping is missing
  if ((obj.shipping === undefined || obj.shipping === 0) && obj.deliveryCharge) {
    obj.shipping = obj.deliveryCharge;
  }

  // Ensure tax and shipping have defaults
  if (obj.tax === undefined) obj.tax = 0;
  if (obj.shipping === undefined) obj.shipping = 0;
  if (obj.discount === undefined) obj.discount = 0;

  return obj;
}

// ─── Export orders to CSV ───────────────────────────────────────────────────
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus, from, to } = req.query;
    let query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to + 'T23:59:59');
    }
    const orders = await Order.find(query).populate('customerId', 'name email phone').sort({ createdAt: -1 });
    const rows = [['Order #', 'Customer', 'Email', 'Phone', 'Items', 'Subtotal', 'Shipping', 'Discount', 'Total', 'Status', 'Payment Status', 'Payment Method', 'City', 'Address', 'Date']];
    orders.forEach(o => {
      const n = normalizeOrder(o);
      rows.push([
        n.orderNumber,
        n.customerId?.name || '',
        n.customerId?.email || '',
        n.customerId?.phone || '',
        n.items.length,
        n.subtotal || 0,
        n.shipping || 0,
        n.discount || 0,
        n.total,
        n.status,
        n.paymentStatus,
        n.paymentMethod || '',
        n.shippingAddress?.city || '',
        [n.shippingAddress?.street, n.shippingAddress?.city].filter(Boolean).join(', '),
        new Date(n.createdAt).toISOString().split('T')[0],
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Bulk actions ───────────────────────────────────────────────────────────
router.post('/bulk-action', authMiddleware, async (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: 'No order IDs provided' });
    let updateData = {};
    if (action === 'status') updateData = { status: value };
    else if (action === 'paymentStatus') updateData = { paymentStatus: value };
    else if (action === 'delete') {
      await Order.deleteMany({ _id: { $in: ids } });
      return res.json({ updated: ids.length, message: 'Orders deleted' });
    } else return res.status(400).json({ message: 'Invalid action' });
    const result = await Order.updateMany({ _id: { $in: ids } }, updateData);
    res.json({ updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Public tracking (no auth) ─────────────────────────────────────────────
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: { $regex: req.params.orderNumber, $options: 'i' } })
      .select('orderNumber status paymentStatus shippingAddress items subtotal shipping discount total trackingNumber courierName estimatedDeliveryDate createdAt statusHistory deliveredAt');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus, search, customer, from, to } = req.query;
    let query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to + 'T23:59:59');
    }

    let orders;
    if (search || customer) {
      orders = await Order.find(query)
        .populate('customerId', 'name email phone')
        .sort({ createdAt: -1 });
      orders = orders.filter(o => {
        if (search) {
          const orderNum = (o.orderNumber || '').toLowerCase().includes(search.toLowerCase());
          const cName = (o.customerId?.name || '').toLowerCase().includes(search.toLowerCase());
          if (!orderNum && !cName) return false;
        }
        if (customer) {
          const cId = o.customerId?._id?.toString() || '';
          if (cId !== customer) return false;
        }
        return true;
      });
    } else {
      orders = await Order.find(query)
        .populate('customerId', 'name email phone')
        .sort({ createdAt: -1 });
    }
    res.json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name images');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `#ORD-${String(count + 1).padStart(5, '0')}`;

    const order = new Order({
      ...req.body,
      orderNumber,
    });
    const savedOrder = await order.save();

    // Update customer stats
    await Customer.findByIdAndUpdate(req.body.customerId, {
      $inc: { totalOrders: 1, totalSpent: req.body.total },
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status, updatedAt: new Date(), note: note || '' });
    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') order.cancelledAt = new Date();
    await order.save();
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.patch('/:id/payment-status', authMiddleware, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true }).populate('customerId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign tracking number / courier
router.patch('/:id/tracking', authMiddleware, async (req, res) => {
  try {
    const { trackingNumber, courierName, estimatedDeliveryDate } = req.body;
    const update = {};
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (courierName !== undefined) update.courierName = courierName;
    if (estimatedDeliveryDate) update.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true }).populate('customerId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add / update admin note
router.patch('/:id/note', authMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { notes: note }, { new: true }).populate('customerId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get invoice data
router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('items.productId', 'name images sku');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
