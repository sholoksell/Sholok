const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

    const [total, newCustomers, returning, topSpenders, groupDist] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Customer.countDocuments({ totalOrders: { $gt: 1 } }),
      Customer.find({ totalOrders: { $gt: 0 } })
        .select('name email totalSpent totalOrders group')
        .sort({ totalSpent: -1 }).limit(10),
      Customer.aggregate([
        { $group: { _id: '$group', count: { $sum: 1 }, totalRevenue: { $sum: '$totalSpent' } } },
      ]),
    ]);

    const allCustomers = await Customer.find().select('totalSpent totalOrders createdAt');
    const ltv = allCustomers.length ? allCustomers.reduce((s, c) => s + c.totalSpent, 0) / allCustomers.length : 0;
    const avgOrderFreq = allCustomers.length ? allCustomers.reduce((s, c) => s + c.totalOrders, 0) / allCustomers.length : 0;
    const retentionRate = total > 0 ? Math.round((returning / total) * 100) : 0;
    const activeRecently = await Customer.countDocuments({ lastLoginDate: { $gte: ninetyDaysAgo } });

    res.json({
      total,
      newLast30Days: newCustomers,
      returning,
      firstTime: total - returning,
      topSpenders,
      groupDistribution: groupDist,
      avgLifetimeValue: Math.round(ltv),
      avgOrderFrequency: Math.round(avgOrderFreq * 10) / 10,
      retentionRate,
      activeRecently,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── EXPORT CSV ───────────────────────────────────────────────────────────────
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { status, group } = req.query;
    let query = {};
    if (status) query.status = status;
    if (group) query.group = group;

    const customers = await Customer.find(query).select('-password -passwordResetToken -activationToken').lean();

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Group', 'GroupDiscount', 'TotalOrders', 'TotalSpent', 'RewardPoints', 'City', 'Country', 'CreatedAt'];
    const rows = customers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      c.status || 'active',
      c.group || 'regular',
      c.groupDiscount || 0,
      c.totalOrders || 0,
      c.totalSpent || 0,
      c.rewardPoints || 0,
      `"${(c.address?.city || '').replace(/"/g, '""')}"`,
      `"${(c.address?.country || '').replace(/"/g, '""')}"`,
      c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── IMPORT CSV/JSON ──────────────────────────────────────────────────────────
router.post('/import', authMiddleware, async (req, res) => {
  try {
    const { customers: rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No customer data provided' });
    }

    let imported = 0, skipped = 0, errors = [];
    for (const row of rows) {
      try {
        const existing = await Customer.findOne({ email: row.email?.toLowerCase() });
        if (existing) { skipped++; continue; }
        if (!row.name || !row.email) { errors.push(`Missing name/email for row`); skipped++; continue; }
        await Customer.create({
          name: row.name,
          email: row.email.toLowerCase(),
          phone: row.phone || '',
          status: ['active', 'inactive', 'blocked'].includes(row.status) ? row.status : 'active',
          group: ['regular', 'wholesale', 'vip', 'dealer'].includes(row.group) ? row.group : 'regular',
          groupDiscount: parseFloat(row.groupDiscount) || 0,
          address: {
            city: row.city || '',
            country: row.country || 'Bangladesh',
          },
        });
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

// ─── ADDRESS BOOK (admin) ─────────────────────────────────────────────────────
router.post('/:id/addresses', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (req.body.isDefault) {
      customer.addresses.forEach(a => { a.isDefault = false; });
    }
    if (customer.addresses.length === 0) req.body.isDefault = true;
    customer.addresses.push(req.body);
    await customer.save();
    res.json(customer.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/addresses/:addrId', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const addr = customer.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) {
      customer.addresses.forEach(a => { a.isDefault = false; });
    }
    Object.assign(addr, req.body);
    await customer.save();
    res.json(customer.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id/addresses/:addrId', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    customer.addresses = customer.addresses.filter(a => a._id.toString() !== req.params.addrId);
    // Ensure at least one default if any remain
    if (customer.addresses.length > 0 && !customer.addresses.some(a => a.isDefault)) {
      customer.addresses[0].isDefault = true;
    }
    await customer.save();
    res.json(customer.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─── SECURITY: Reset Password / Send Activation ───────────────────────────────
router.post('/:id/reset-password', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Generate a temporary 10-char password
    const tempPassword = crypto.randomBytes(5).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 10);
    customer.password = hashed;
    customer.passwordResetToken = null;
    customer.passwordResetExpires = null;
    await customer.save();

    res.json({
      success: true,
      tempPassword,
      message: `Password has been reset. Share the temporary password with the customer: ${tempPassword}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/send-activation', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const token = crypto.randomBytes(20).toString('hex');
    customer.activationToken = token;
    customer.isActivated = false;
    await customer.save();

    const activationLink = `${process.env.STOREFRONT_URL || 'http://localhost:3000'}/activate?token=${token}&email=${encodeURIComponent(customer.email)}`;
    res.json({ success: true, activationLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, group } = req.query;
    let query = {};

    if (status) query.status = status;
    if (group) query.group = group;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete customer
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customerId = req.params.id;

    // Find any active (non-final) orders for this customer so we can restore stock
    const FINAL_STATUSES = ['delivered', 'cancelled', 'refunded'];
    const activeOrders = await Order.find({
      customerId,
      status: { $nin: FINAL_STATUSES },
    });

    let restoredItems = 0;
    for (const order of activeOrders) {
      for (const item of order.items) {
        if (!item.productId || !item.quantity) continue;
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
        restoredItems += item.quantity;
      }
      // Mark order as cancelled so history is preserved with correct status
      order.status = 'cancelled';
      await order.save();
    }

    // Remove customer's reviews (orphaned data)
    await Review.deleteMany({ customerId });

    const customer = await Customer.findByIdAndDelete(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer deleted successfully',
      restoredOrders: activeOrders.length,
      restoredItems,
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get customer full details (profile + orders + reviews + wishlist)
router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('wishlist', 'name thumbnail regularPrice');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [orders, reviews] = await Promise.all([
      Order.find({ customerId: req.params.id }).sort({ createdAt: -1 }).limit(20),
      Review.find({ customerId: req.params.id })
        .populate('productId', 'name thumbnail')
        .sort({ createdAt: -1 }),
    ]);

    res.json({ customer, orders, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update customer group
router.patch('/:id/group', authMiddleware, async (req, res) => {
  try {
    const { group, groupDiscount } = req.body;
    const update = { group };
    if (groupDiscount !== undefined) update.groupDiscount = groupDiscount;
    const customer = await Customer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add/adjust reward points
router.post('/:id/points', authMiddleware, async (req, res) => {
  try {
    const { type, points, description } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const pointsChange = type === 'redeemed' ? -Math.abs(points) : Math.abs(points);
    customer.rewardPoints = Math.max(0, customer.rewardPoints + pointsChange);
    customer.pointsHistory.push({ type, points: Math.abs(points), description, date: new Date() });

    // Update totals
    if (type === 'redeemed') {
      customer.totalPointsRedeemed = (customer.totalPointsRedeemed || 0) + Math.abs(points);
    } else {
      customer.totalPointsEarned = (customer.totalPointsEarned || 0) + Math.abs(points);
    }

    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get customer login history
router.get('/:id/login-activity', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select('lastLoginDate lastLoginIp loginHistory');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update customer status (active / inactive / blocked / suspended)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, suspendedUntil } = req.body;
    const validStatuses = ['active', 'inactive', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const update = { status };
    // suspendedUntil is only meaningful when status is 'blocked' as a temporary measure
    if (suspendedUntil !== undefined) update.suspendedUntil = suspendedUntil;
    else update.suspendedUntil = null;

    const customer = await Customer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send notification / message to a single customer (admin)
router.post('/:id/notify', authMiddleware, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.notifications.push({ title, message, type, createdAt: new Date() });
    await customer.save();
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk notify multiple customers (admin)
router.post('/bulk-notify', authMiddleware, async (req, res) => {
  try {
    const { customerIds, title, message, type = 'info' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }
    const notification = { title, message, type, createdAt: new Date() };
    await Customer.updateMany(
      { _id: { $in: customerIds } },
      { $push: { notifications: notification } }
    );
    res.json({ success: true, sent: customerIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications for a customer (admin view)
router.get('/:id/notifications', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('notifications');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer.notifications.slice().reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
