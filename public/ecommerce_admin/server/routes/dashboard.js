const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Total Revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Total Customers
    const totalCustomers = await Customer.countDocuments();

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Populate product details
    const topProductsWithDetails = await Product.populate(topProducts, {
      path: '_id',
      select: 'name images',
    });

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      revenueByMonth,
      ordersByStatus,
      topProducts: topProductsWithDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get('/recent-activity', authMiddleware, async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
