const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// Sales Reports
router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();

    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate.setDate(startDate.getDate() - 30);
    }

    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesByCategory = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          revenue: { $sum: '$items.total' },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    const salesByPaymentMethod = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalRevenue = salesByDay.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = salesByDay.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      summary: { totalRevenue, totalOrders, avgOrderValue },
      salesByDay,
      salesByCategory,
      salesByPaymentMethod,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Orders Report
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const ordersByPaymentStatus = await Order.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
    ]);

    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    const refundedOrders = await Order.countDocuments({ status: 'refunded' });

    res.json({ ordersByStatus, ordersByPaymentStatus, cancelledOrders, refundedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer Reports
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const topCustomers = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    const Customer2 = mongoose.model('Customer');
    const topCustomersWithDetails = await Customer2.populate(topCustomers, {
      path: '_id',
      select: 'name email phone',
    });

    res.json({ totalCustomers, newCustomers, topCustomers: topCustomersWithDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Performance Reports
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const topSelling = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    const lowStock = await Product.find({ stock: { $lt: 10 } })
      .select('name stock price images')
      .sort({ stock: 1 })
      .limit(20);

    const outOfStock = await Product.countDocuments({ stock: 0 });
    const totalProducts = await Product.countDocuments();

    res.json({ topSelling, lowStock, outOfStock, totalProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Overview summary
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);

    const monthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);

    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });

    res.json({
      todayRevenue: todayRevenue[0]?.total || 0,
      todayOrders: todayRevenue[0]?.count || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      monthOrders: monthRevenue[0]?.count || 0,
      pendingOrders,
      processingOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Finance Report
router.get('/finance', authMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate.setDate(startDate.getDate() - 30);
    }

    const totalRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$total' }, shipping: { $sum: { $ifNull: ['$shipping', '$deliveryCharge', 0] } }, discount: { $sum: { $ifNull: ['$discount', 0] } }, count: { $sum: 1 } } },
    ]);

    const refundedTotal = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'refunded' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const cancelledCount = await Order.countDocuments({ createdAt: { $gte: startDate }, status: 'cancelled' });
    const pendingPayments = await Order.aggregate([
      { $match: { paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);

    const paymentMethodBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);

    const revenueVal = totalRevenue[0]?.revenue || 0;
    const refundsVal = refundedTotal[0]?.total || 0;
    res.json({
      revenue: revenueVal,
      shippingRevenue: totalRevenue[0]?.shipping || 0,
      discounts: totalRevenue[0]?.discount || 0,
      totalOrders: totalRevenue[0]?.count || 0,
      refunds: refundsVal,
      cancelledCount,
      pendingPayments: pendingPayments[0]?.total || 0,
      pendingPaymentsCount: pendingPayments[0]?.count || 0,
      paymentMethodBreakdown,
      netRevenue: revenueVal - refundsVal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stock & Inventory Report
router.get('/stock', authMiddleware, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.find({ stock: { $gt: 0, $lte: 10 } })
      .select('name stock price images category')
      .sort({ stock: 1 });
    const wellStocked = await Product.countDocuments({ stock: { $gt: 10 } });
    const totalStockValue = await Product.aggregate([
      { $group: { _id: null, value: { $sum: { $multiply: ['$stock', '$price'] } } } },
    ]);
    const categorySummary = await Product.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 }, stock: { $sum: '$stock' }, value: { $sum: { $multiply: ['$stock', '$price'] } } } },
      { $sort: { total: -1 } },
    ]);
    res.json({
      totalProducts, outOfStock, lowStockCount: lowStock.length, wellStocked,
      totalStockValue: totalStockValue[0]?.value || 0,
      lowStockItems: lowStock,
      categorySummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export sales report CSV
router.get('/export/sales', authMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
    }
    const orders = await Order.find({ createdAt: { $gte: startDate }, paymentStatus: 'paid' })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    const rows = [['Order #', 'Customer', 'Email', 'Total', 'Shipping', 'Discount', 'Payment Method', 'Date']];
    orders.forEach(o => {
      rows.push([o.orderNumber, o.customerId?.name || '', o.customerId?.email || '', o.total, o.shipping || o.deliveryCharge || 0, o.discount || 0, o.paymentMethod || '', new Date(o.createdAt).toISOString().split('T')[0]]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${period}.csv"`);
    res.send(csv);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
