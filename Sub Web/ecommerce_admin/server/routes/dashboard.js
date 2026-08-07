const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders WHERE payment_status = 'paid'"
    );
    const [[{ totalOrders }]]    = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(*) AS totalCustomers FROM customers');
    const [[{ totalProducts }]]  = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ lowStockProducts }]] = await pool.query('SELECT COUNT(*) AS lowStockProducts FROM products WHERE stock < 10');

    // Revenue by month (last 6 months)
    const [revenueByMonth] = await pool.query(
      `SELECT YEAR(created_at) AS year, MONTH(created_at) AS month,
              SUM(total) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY YEAR(created_at), MONTH(created_at)
       ORDER BY year ASC, month ASC`
    );

    // Orders by status
    const [ordersByStatus] = await pool.query(
      'SELECT status AS _id, COUNT(*) AS count FROM orders GROUP BY status'
    );

    // Top selling products
    const [topProducts] = await pool.query(
      `SELECT oi.product_id AS _id, oi.product_name AS name,
              SUM(oi.quantity) AS totalQuantity, SUM(oi.total) AS totalRevenue,
              p.thumbnail AS image
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       GROUP BY oi.product_id, oi.product_name, p.thumbnail
       ORDER BY totalQuantity DESC LIMIT 5`
    );

    res.json({
      totalRevenue, totalOrders, totalCustomers, totalProducts, lowStockProducts,
      revenueByMonth: revenueByMonth.map(r => ({
        _id: { year: r.year, month: r.month }, revenue: r.revenue, orders: r.orders,
      })),
      ordersByStatus,
      topProducts: topProducts.map(p => ({
        _id: { _id: p._id, name: p.name, images: p.image ? [p.image] : [] },
        totalQuantity: p.totalQuantity, totalRevenue: p.totalRevenue,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recent activity
router.get('/recent-activity', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC LIMIT 10`
    );
    res.json(orders.map(o => ({
      _id:         o.id,
      orderNumber: o.order_number,
      customerId:  { _id: o.customer_id, name: o.customer_name },
      status:      o.status,
      total:       o.total,
      createdAt:   o.created_at,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
