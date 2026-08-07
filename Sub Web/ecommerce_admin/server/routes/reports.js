const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function periodStart(period) {
  const d = new Date();
  switch (period) {
    case '7d':  d.setDate(d.getDate() - 7);         break;
    case '90d': d.setDate(d.getDate() - 90);        break;
    case '1y':  d.setFullYear(d.getFullYear() - 1); break;
    default:    d.setDate(d.getDate() - 30);         break; // 30d
  }
  return d;
}

/* ─────────────────────── OVERVIEW ───────────────────────────────── */

router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [[todayRow]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS count FROM orders WHERE payment_status='paid' AND created_at >= ?",
      [today]
    );
    const [[monthRow]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS count FROM orders WHERE payment_status='paid' AND created_at >= ?",
      [thirtyDaysAgo]
    );
    const [[{ pendingOrders }]]    = await pool.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status='pending'");
    const [[{ processingOrders }]] = await pool.query("SELECT COUNT(*) AS processingOrders FROM orders WHERE status='processing'");

    res.json({
      todayRevenue:     Number(todayRow.total),
      todayOrders:      Number(todayRow.count),
      monthRevenue:     Number(monthRow.total),
      monthOrders:      Number(monthRow.count),
      pendingOrders:    Number(pendingOrders),
      processingOrders: Number(processingOrders),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── SALES ──────────────────────────────────── */

router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = periodStart(period);

    const [salesByDay] = await pool.query(
      `SELECT DATE(created_at) AS _id, SUM(total) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= ?
       GROUP BY DATE(created_at)
       ORDER BY _id ASC`,
      [startDate]
    );

    const [salesByCategory] = await pool.query(
      `SELECT c.name AS _id, SUM(oi.total) AS revenue, SUM(oi.quantity) AS quantity
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE o.payment_status = 'paid' AND o.created_at >= ?
       GROUP BY c.id, c.name
       ORDER BY revenue DESC
       LIMIT 10`,
      [startDate]
    );

    const [salesByPaymentMethod] = await pool.query(
      `SELECT payment_method AS _id, SUM(total) AS revenue, COUNT(*) AS count
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= ?
       GROUP BY payment_method
       ORDER BY revenue DESC`,
      [startDate]
    );

    const totalRevenue = salesByDay.reduce((sum, d) => sum + Number(d.revenue), 0);
    const totalOrders  = salesByDay.reduce((sum, d) => sum + Number(d.orders), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      summary: { totalRevenue, totalOrders, avgOrderValue },
      salesByDay: salesByDay.map(d => ({ _id: d._id, revenue: Number(d.revenue), orders: Number(d.orders) })),
      salesByCategory: salesByCategory.map(d => ({ _id: d._id, revenue: Number(d.revenue), quantity: Number(d.quantity) })),
      salesByPaymentMethod: salesByPaymentMethod.map(d => ({ _id: d._id, revenue: Number(d.revenue), count: Number(d.count) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── ORDERS ─────────────────────────────────── */

router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const [ordersByStatus] = await pool.query(
      'SELECT status AS _id, COUNT(*) AS count FROM orders GROUP BY status'
    );
    const [ordersByPaymentStatus] = await pool.query(
      'SELECT payment_status AS _id, COUNT(*) AS count FROM orders GROUP BY payment_status'
    );
    const [[{ cancelledOrders }]] = await pool.query("SELECT COUNT(*) AS cancelledOrders FROM orders WHERE status='cancelled'");
    const [[{ refundedOrders }]]  = await pool.query("SELECT COUNT(*) AS refundedOrders FROM orders WHERE status='refunded'");

    res.json({
      ordersByStatus:        ordersByStatus.map(r => ({ _id: r._id, count: Number(r.count) })),
      ordersByPaymentStatus: ordersByPaymentStatus.map(r => ({ _id: r._id, count: Number(r.count) })),
      cancelledOrders:       Number(cancelledOrders),
      refundedOrders:        Number(refundedOrders),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── CUSTOMERS ──────────────────────────────── */

router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(*) AS totalCustomers FROM customers');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [[{ newCustomers }]] = await pool.query(
      'SELECT COUNT(*) AS newCustomers FROM customers WHERE created_at >= ?', [thirtyDaysAgo]
    );

    const [topCustomers] = await pool.query(
      `SELECT o.customer_id AS _id, c.name, c.email, c.phone,
              SUM(o.total) AS totalSpent, COUNT(o.id) AS orderCount
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.payment_status = 'paid'
       GROUP BY o.customer_id, c.name, c.email, c.phone
       ORDER BY totalSpent DESC
       LIMIT 10`
    );

    const [groupDistribution] = await pool.query(
      'SELECT customer_group AS _id, COUNT(*) AS count FROM customers GROUP BY customer_group'
    );

    res.json({
      totalCustomers:    Number(totalCustomers),
      newCustomers:      Number(newCustomers),
      topCustomers: topCustomers.map(c => ({
        _id:        { _id: c._id, name: c.name, email: c.email, phone: c.phone },
        totalSpent: Number(c.totalSpent),
        orderCount: Number(c.orderCount),
      })),
      groupDistribution: groupDistribution.map(r => ({ _id: r._id, count: Number(r.count) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── PRODUCTS ───────────────────────────────── */

router.get('/products', authMiddleware, async (req, res) => {
  try {
    const [topSelling] = await pool.query(
      `SELECT oi.product_id AS _id, oi.product_name AS productName,
              SUM(oi.quantity) AS totalQuantity, SUM(oi.total) AS totalRevenue,
              p.thumbnail AS image
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.payment_status = 'paid'
       GROUP BY oi.product_id, oi.product_name, p.thumbnail
       ORDER BY totalQuantity DESC
       LIMIT 10`
    );

    const [lowStock] = await pool.query(
      `SELECT p.id AS _id, p.name, p.stock, p.regular_price AS price, p.thumbnail,
              c.name AS categoryName
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.stock > 0 AND p.stock < 10
       ORDER BY p.stock ASC
       LIMIT 20`
    );

    const [[{ outOfStock }]]    = await pool.query('SELECT COUNT(*) AS outOfStock FROM products WHERE stock = 0');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');

    res.json({
      topSelling: topSelling.map(p => ({
        _id: p._id, productName: p.productName,
        totalQuantity: Number(p.totalQuantity),
        totalRevenue:  Number(p.totalRevenue),
        image: p.image,
      })),
      lowStock: lowStock.map(p => ({
        _id: p._id, name: p.name,
        stock: Number(p.stock),
        price: Number(p.price),
        thumbnail: p.thumbnail,
        categoryName: p.categoryName,
      })),
      outOfStock:    Number(outOfStock),
      totalProducts: Number(totalProducts),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── FINANCE ────────────────────────────────── */

router.get('/finance', authMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = periodStart(period);

    const [[revenueRow]] = await pool.query(
      `SELECT
         COALESCE(SUM(total), 0)                          AS revenue,
         COALESCE(SUM(shipping + delivery_charge), 0)     AS shippingRevenue,
         COALESCE(SUM(discount), 0)                       AS discounts,
         COUNT(*)                                          AS count
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= ?`,
      [startDate]
    );

    const [[{ refunds }]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS refunds FROM orders WHERE status='refunded' AND created_at >= ?",
      [startDate]
    );
    const [[{ cancelledCount }]] = await pool.query(
      "SELECT COUNT(*) AS cancelledCount FROM orders WHERE status='cancelled' AND created_at >= ?",
      [startDate]
    );
    const [[pendingPaymentsRow]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS count FROM orders WHERE payment_status='pending'"
    );

    const [paymentMethodBreakdown] = await pool.query(
      `SELECT payment_method AS _id, SUM(total) AS revenue, COUNT(*) AS count
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= ?
       GROUP BY payment_method
       ORDER BY revenue DESC`,
      [startDate]
    );

    const revenueVal = Number(revenueRow.revenue);
    const refundsVal = Number(refunds);

    res.json({
      revenue:               revenueVal,
      shippingRevenue:       Number(revenueRow.shippingRevenue),
      discounts:             Number(revenueRow.discounts),
      totalOrders:           revenueRow.count,
      refunds:               refundsVal,
      cancelledCount,
      pendingPayments:       Number(pendingPaymentsRow.total),
      pendingPaymentsCount:  pendingPaymentsRow.count,
      paymentMethodBreakdown: paymentMethodBreakdown.map(r => ({ _id: r._id, revenue: Number(r.revenue), count: Number(r.count) })),
      netRevenue:            revenueVal - refundsVal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── STOCK / INVENTORY ──────────────────────── */

router.get('/stock', authMiddleware, async (req, res) => {
  try {
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ outOfStock }]]    = await pool.query('SELECT COUNT(*) AS outOfStock FROM products WHERE stock = 0');
    const [[{ wellStocked }]]   = await pool.query('SELECT COUNT(*) AS wellStocked FROM products WHERE stock > 10');
    const [[{ totalStockValue }]] = await pool.query(
      'SELECT COALESCE(SUM(stock * regular_price), 0) AS totalStockValue FROM products'
    );

    const [lowStockItems] = await pool.query(
      `SELECT p.id AS _id, p.name, p.stock, p.regular_price AS price, p.thumbnail,
              c.name AS categoryName
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.stock > 0 AND p.stock <= 10
       ORDER BY p.stock ASC`
    );

    const [categorySummary] = await pool.query(
      `SELECT c.name AS _id, COUNT(p.id) AS total,
              SUM(p.stock) AS stock,
              SUM(p.stock * p.regular_price) AS value
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       GROUP BY c.id, c.name
       ORDER BY total DESC`
    );

    res.json({
      totalProducts:     Number(totalProducts),
      outOfStock:        Number(outOfStock),
      lowStock:          lowStockItems.length,
      wellStocked:       Number(wellStocked),
      totalStockValue:   Number(totalStockValue),
      lowStockItems:     lowStockItems.map(p => ({
        _id: p._id, name: p.name,
        stock: Number(p.stock),
        price: Number(p.price),
        thumbnail: p.thumbnail,
        categoryName: p.categoryName,
      })),
      categoryStockSummary: categorySummary.map(r => ({
        _id:        r._id,
        total:      Number(r.total),
        totalStock: Number(r.stock),
        totalValue: Number(r.value),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── EXPORT CSV ─────────────────────────────── */

router.get('/export/sales', authMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = periodStart(period);

    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.payment_status = 'paid' AND o.created_at >= ?
       ORDER BY o.created_at DESC`,
      [startDate]
    );

    const rows = [['Order #', 'Customer', 'Email', 'Total', 'Shipping', 'Discount', 'Payment Method', 'Date']];
    orders.forEach(o => {
      rows.push([
        o.order_number        || '',
        o.customer_name       || '',
        o.customer_email      || '',
        o.total,
        o.shipping            || 0,
        o.discount            || 0,
        o.payment_method      || '',
        new Date(o.created_at).toISOString().split('T')[0],
      ]);
    });

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${period}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/export/stock', authMiddleware, async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.name, p.sku, p.stock, p.regular_price AS price, p.status,
              c.name AS category
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.stock ASC`
    );

    const rows = [['Name', 'SKU', 'Stock', 'Price', 'Category', 'Status']];
    products.forEach(p => {
      rows.push([p.name, p.sku || '', p.stock, p.price, p.category || '', p.status]);
    });

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stock-report.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
