const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

// ── Use raw MongoDB collection access to bypass schema conflicts ──
// Both shopping server & admin panel share the same DB but define schemas differently.
// We query the raw collections so ALL documents are returned regardless of which server created them.

function getDb() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected yet');
  }
  return mongoose.connection.db;
}

function getCollection(name) {
  return getDb().collection(name);
}

// ── Helper: date range from month/year ──
function monthRange(month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

// ── Helper: extract delivery/shipping cost from order (handles both schemas) ──
function getShippingCost(order) {
  return (order.deliveryCharge || 0) + (order.shipping || 0);
}

// ── Helper: pretty payment method name ──
function prettyPaymentMethod(pm) {
  if (!pm) return 'Unknown';
  return pm.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ══════════════════════════════════════════════════════════════
// GET /dashboard — Full finance dashboard data from real ecommerce DB
// ══════════════════════════════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const m = parseInt(req.query.month) || (now.getMonth() + 1);
    const y = parseInt(req.query.year) || now.getFullYear();
    const { start, end } = monthRange(m, y);

    const ordersCol = getCollection('orders');
    const productsCol = getCollection('products');
    const customersCol = getCollection('customers');
    const paymentsCol = getCollection('payments');

    // ── Current month orders (raw docs) ──
    const monthOrders = await ordersCol.find({ createdAt: { $gte: start, $lte: end } }).toArray();

    let totalRevenue = 0, paidRevenue = 0, totalDiscount = 0, totalShippingCost = 0;
    let pendingOrders = 0, deliveredOrders = 0, cancelledOrders = 0, refundedOrders = 0;
    const dailyRevenue = {};
    const paymentMethodBreakdown = {};
    const productRevenue = {};
    const statusCounts = {};

    monthOrders.forEach((order) => {
      const orderTotal = order.total || 0;
      totalRevenue += orderTotal;
      totalDiscount += order.discount || 0;
      totalShippingCost += getShippingCost(order);

      if (order.paymentStatus === 'paid') paidRevenue += orderTotal;

      // Status counts (handles both enum sets)
      const st = order.status || 'unknown';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
      if (st === 'pending') pendingOrders++;
      if (st === 'delivered') deliveredOrders++;
      if (st === 'cancelled') cancelledOrders++;
      if (st === 'refunded') refundedOrders++;

      // Daily revenue
      const dayKey = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!dailyRevenue[dayKey]) dailyRevenue[dayKey] = { revenue: 0, orders: 0, paid: 0 };
      dailyRevenue[dayKey].revenue += orderTotal;
      dailyRevenue[dayKey].orders += 1;
      if (order.paymentStatus === 'paid') dailyRevenue[dayKey].paid += orderTotal;

      // Payment method
      const pm = prettyPaymentMethod(order.paymentMethod);
      paymentMethodBreakdown[pm] = (paymentMethodBreakdown[pm] || 0) + orderTotal;

      // Product-level revenue from items
      (order.items || []).forEach((item) => {
        const pName = item.productName || 'Unknown Product';
        const pId = item.productId ? String(item.productId) : pName;
        if (!productRevenue[pId]) productRevenue[pId] = { name: pName, totalQty: 0, totalRevenue: 0 };
        productRevenue[pId].totalQty += item.quantity || 0;
        productRevenue[pId].totalRevenue += item.total || (item.price * item.quantity) || 0;
      });
    });

    // ── 12-month trend via aggregation on raw collection ──
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const pipeline = [
        { $match: { createdAt: { $gte: d, $lte: mEnd } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ['$total', 0] } },
            paidRevenue: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, { $ifNull: ['$total', 0] }, 0],
              },
            },
            orderCount: { $sum: 1 },
            totalDiscount: { $sum: { $ifNull: ['$discount', 0] } },
          },
        },
      ];
      const result = await ordersCol.aggregate(pipeline).toArray();
      const r = result[0] || { totalRevenue: 0, paidRevenue: 0, orderCount: 0, totalDiscount: 0 };
      monthlyTrend.push({
        month: d.toLocaleString('en', { month: 'short' }),
        year: d.getFullYear(),
        label: `${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`,
        revenue: r.totalRevenue,
        paidRevenue: r.paidRevenue,
        orders: r.orderCount,
        discount: r.totalDiscount,
        profit: r.paidRevenue - r.totalDiscount,
      });
    }

    // ── Top 10 selling products (current month) via raw aggregation ──
    const topProductsPipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: {
              $ifNull: ['$items.total', { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] }],
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ];
    const topProducts = await ordersCol.aggregate(topProductsPipeline).toArray();

    // ── Top customers by spending (lifetime) ──
    const topCustomers = await customersCol
      .find({ totalSpent: { $gt: 0 } })
      .sort({ totalSpent: -1 })
      .limit(10)
      .project({ name: 1, email: 1, phone: 1, totalOrders: 1, totalSpent: 1 })
      .toArray();

    // ── Lifetime totals ──
    const lifetimePipeline = [
      {
        $group: {
          _id: null,
          lifetimeRevenue: { $sum: { $ifNull: ['$total', 0] } },
          lifetimePaid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, { $ifNull: ['$total', 0] }, 0],
            },
          },
          lifetimeOrders: { $sum: 1 },
          lifetimeDiscount: { $sum: { $ifNull: ['$discount', 0] } },
        },
      },
    ];
    const lifetimeAgg = await ordersCol.aggregate(lifetimePipeline).toArray();
    const lifetime = lifetimeAgg[0] || { lifetimeRevenue: 0, lifetimePaid: 0, lifetimeOrders: 0, lifetimeDiscount: 0 };

    const totalCustomers = await customersCol.countDocuments();
    const totalProducts = await productsCol.countDocuments();
    const lowStockProducts = await productsCol.countDocuments({ stock: { $lt: 10 } });

    // ── Payment collection data (admin panel creates these) ──
    let paymentSummary = { totalPaid: 0, completedPayments: 0 };
    try {
      const payPipeline = [
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ];
      const payResult = await paymentsCol.aggregate(payPipeline).toArray();
      if (payResult[0]) {
        paymentSummary = { totalPaid: payResult[0].total, completedPayments: payResult[0].count };
      }
    } catch { /* payments collection might not exist yet */ }

    // ── Build chart data ──
    const dailyChart = Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date: date.slice(5), revenue: d.revenue, orders: d.orders, paid: d.paid }));

    const paymentPie = Object.entries(paymentMethodBreakdown).map(([name, value]) => ({ name, value }));

    const statusPie = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Category-level pie: group by product name for simplicity
    const sortedProducts = Object.values(productRevenue).sort((a, b) => b.totalRevenue - a.totalRevenue);
    const categoryPie = sortedProducts.slice(0, 8).map((p) => ({ name: p.name, value: p.totalRevenue }));

    res.json({
      success: true,
      dashboard: {
        month: m,
        year: y,
        totalRevenue,
        paidRevenue,
        totalOrders: monthOrders.length,
        totalDiscount,
        totalDeliveryCharge: totalShippingCost,
        netProfit: paidRevenue - totalDiscount,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        refundedOrders,

        lifetimeRevenue: lifetime.lifetimeRevenue,
        lifetimePaid: lifetime.lifetimePaid,
        lifetimeOrders: lifetime.lifetimeOrders,
        lifetimeDiscount: lifetime.lifetimeDiscount,
        totalCustomers,
        totalProducts,
        lowStockProducts,

        paymentSummary,

        monthlyTrend,
        dailyChart,
        paymentPie,
        categoryPie,
        statusPie,
        topProducts: topProducts.map((p) => ({
          _id: p._id ? String(p._id) : 'unknown',
          name: p.name || 'Unknown Product',
          totalQty: p.totalQty || 0,
          totalRevenue: p.totalRevenue || 0,
        })),
        topCustomers: topCustomers.map((c) => ({
          _id: String(c._id),
          name: c.name || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          totalOrders: c.totalOrders || 0,
          totalSpent: c.totalSpent || 0,
        })),
      },
    });
  } catch (err) {
    console.error('Finance dashboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// POST /report — Custom date-range sales report
// ══════════════════════════════════════════════════════════════
router.post('/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate required' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const ordersCol = getCollection('orders');

    // Get orders with customer info
    const orders = await ordersCol
      .find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .toArray();

    // Collect customer IDs for lookup
    const customerIds = [...new Set(orders.filter((o) => o.customerId).map((o) => o.customerId))];
    const customersCol = getCollection('customers');
    const customerDocs = await customersCol
      .find({ _id: { $in: customerIds } })
      .project({ name: 1, email: 1, phone: 1 })
      .toArray();
    const customerMap = {};
    customerDocs.forEach((c) => { customerMap[String(c._id)] = c; });

    let totalRevenue = 0, paidRevenue = 0, totalDiscount = 0;
    const statusCounts = {};
    const paymentMethodBreakdown = {};

    orders.forEach((o) => {
      totalRevenue += o.total || 0;
      if (o.paymentStatus === 'paid') paidRevenue += o.total || 0;
      totalDiscount += o.discount || 0;
      const st = o.status || 'unknown';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
      const pm = prettyPaymentMethod(o.paymentMethod);
      paymentMethodBreakdown[pm] = (paymentMethodBreakdown[pm] || 0) + (o.total || 0);
    });

    // Top products in range
    const topProductsPipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: {
              $ifNull: ['$items.total', { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] }],
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ];
    const topProducts = await ordersCol.aggregate(topProductsPipeline).toArray();

    res.json({
      success: true,
      report: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalOrders: orders.length,
        totalRevenue,
        paidRevenue,
        totalDiscount,
        netProfit: paidRevenue - totalDiscount,
        statusCounts,
        paymentMethodBreakdown,
        topProducts: topProducts.map((p) => ({
          _id: p._id ? String(p._id) : 'unknown',
          name: p.name || 'Unknown',
          totalQty: p.totalQty || 0,
          totalRevenue: p.totalRevenue || 0,
        })),
        orders: orders.map((o) => {
          const cust = o.customerId ? customerMap[String(o.customerId)] : null;
          return {
            _id: String(o._id),
            orderNumber: o.orderNumber || '-',
            customer: cust ? { name: cust.name, email: cust.email } : null,
            total: o.total || 0,
            status: o.status || 'unknown',
            paymentStatus: o.paymentStatus || 'unknown',
            paymentMethod: prettyPaymentMethod(o.paymentMethod),
            discount: o.discount || 0,
            itemCount: (o.items || []).length,
            date: o.createdAt,
          };
        }),
      },
    });
  } catch (err) {
    console.error('Finance report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /report/pdf — Download PDF report
// ══════════════════════════════════════════════════════════════
router.get('/report/pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate required' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const ordersCol = getCollection('orders');
    const customersCol = getCollection('customers');

    const orders = await ordersCol
      .find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .toArray();

    // Customer lookup
    const customerIds = [...new Set(orders.filter((o) => o.customerId).map((o) => o.customerId))];
    const customerDocs = await customersCol
      .find({ _id: { $in: customerIds } })
      .project({ name: 1 })
      .toArray();
    const customerMap = {};
    customerDocs.forEach((c) => { customerMap[String(c._id)] = c; });

    let totalRevenue = 0, paidRevenue = 0, totalDiscount = 0;
    const statusCounts = {};
    orders.forEach((o) => {
      totalRevenue += o.total || 0;
      if (o.paymentStatus === 'paid') paidRevenue += o.total || 0;
      totalDiscount += o.discount || 0;
      const st = o.status || 'unknown';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    // Top products
    const topProducts = await ordersCol.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $ifNull: ['$items.total', { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] }] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]).toArray();

    // ── Generate PDF ──
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `Finance_Report_${startDate}_to_${endDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // ── Title ──
    doc.fontSize(22).font('Helvetica-Bold').text('Sholok Finance Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#666666')
      .text(`Period: ${start.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).text(`Generated: ${new Date().toLocaleString('en-GB')}`, { align: 'center' });
    doc.moveDown(1);

    // ── Divider ──
    doc.strokeColor('#22c55e').lineWidth(2)
      .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // ── Summary Box ──
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Financial Summary');
    doc.moveDown(0.5);

    const summaryData = [
      ['Total Orders', String(orders.length)],
      ['Total Revenue', `BDT ${totalRevenue.toLocaleString()}`],
      ['Paid Revenue', `BDT ${paidRevenue.toLocaleString()}`],
      ['Total Discount', `BDT ${totalDiscount.toLocaleString()}`],
      ['Net Profit', `BDT ${(paidRevenue - totalDiscount).toLocaleString()}`],
    ];

    summaryData.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica').fillColor('#333333')
        .text(label, 70, doc.y, { continued: true, width: 200 })
        .font('Helvetica-Bold').text(`  ${value}`);
      doc.moveDown(0.2);
    });

    doc.moveDown(0.8);

    // ── Order Status Breakdown ──
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Order Status');
    doc.moveDown(0.3);
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.fontSize(10).font('Helvetica').fillColor('#333333')
        .text(`  ${status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}`, { continued: true, width: 200 })
        .font('Helvetica-Bold').text(`  ${count} orders`);
      doc.moveDown(0.15);
    });

    doc.moveDown(0.8);

    // ── Top Products ──
    if (topProducts.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Top Selling Products');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#666666');
      doc.text('#', 60, tableTop, { width: 25 });
      doc.text('Product Name', 85, tableTop, { width: 230 });
      doc.text('Qty Sold', 320, tableTop, { width: 80 });
      doc.text('Revenue', 410, tableTop, { width: 100 });
      doc.moveDown(0.5);

      doc.strokeColor('#dddddd').lineWidth(0.5)
        .moveTo(55, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      topProducts.forEach((p, i) => {
        if (doc.y > 720) { doc.addPage(); }
        const rowY = doc.y;
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        doc.text(`${i + 1}`, 60, rowY, { width: 25 });
        doc.text(p.name || 'Unknown', 85, rowY, { width: 230 });
        doc.text(String(p.totalQty), 320, rowY, { width: 80 });
        doc.text(`BDT ${(p.totalRevenue || 0).toLocaleString()}`, 410, rowY, { width: 100 });
        doc.moveDown(0.5);
      });
    }

    // ── Order Details (max 100 in PDF) ──
    if (orders.length > 0 && orders.length <= 200) {
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Order Details');
      doc.moveDown(0.3);

      const hdrY = doc.y;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#666666');
      doc.text('Order #', 50, hdrY, { width: 90 });
      doc.text('Customer', 145, hdrY, { width: 130 });
      doc.text('Total', 280, hdrY, { width: 80 });
      doc.text('Status', 365, hdrY, { width: 70 });
      doc.text('Payment', 440, hdrY, { width: 80 });
      doc.moveDown(0.4);
      doc.strokeColor('#dddddd').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);

      orders.forEach((o) => {
        if (doc.y > 730) { doc.addPage(); }
        const ry = doc.y;
        const cust = o.customerId ? customerMap[String(o.customerId)] : null;
        doc.fontSize(8).font('Helvetica').fillColor('#333333');
        doc.text(o.orderNumber || '-', 50, ry, { width: 90 });
        doc.text(cust?.name || '-', 145, ry, { width: 130 });
        doc.text(`BDT ${(o.total || 0).toLocaleString()}`, 280, ry, { width: 80 });
        doc.text((o.status || '-').replace(/_/g, ' '), 365, ry, { width: 70 });
        doc.text(o.paymentStatus || '-', 440, ry, { width: 80 });
        doc.moveDown(0.4);
      });
    }

    // ── Footer ──
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#999999')
      .text('This report was auto-generated by Sholok Finance System.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /report/csv — Download CSV report
// ══════════════════════════════════════════════════════════════
router.get('/report/csv', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate and endDate required' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const ordersCol = getCollection('orders');
    const customersCol = getCollection('customers');

    const orders = await ordersCol
      .find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .toArray();

    // Customer lookup
    const customerIds = [...new Set(orders.filter((o) => o.customerId).map((o) => o.customerId))];
    const customerDocs = await customersCol
      .find({ _id: { $in: customerIds } })
      .project({ name: 1, email: 1, phone: 1 })
      .toArray();
    const customerMap = {};
    customerDocs.forEach((c) => { customerMap[String(c._id)] = c; });

    const rows = [['Order Number', 'Date', 'Customer', 'Email', 'Items', 'Subtotal', 'Discount', 'Delivery/Shipping', 'Total', 'Status', 'Payment Status', 'Payment Method']];
    orders.forEach((o) => {
      const cust = o.customerId ? customerMap[String(o.customerId)] : null;
      rows.push([
        o.orderNumber || '-',
        o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '-',
        cust?.name || '-',
        cust?.email || '-',
        String((o.items || []).length),
        String(o.subtotal || 0),
        String(o.discount || 0),
        String(getShippingCost(o)),
        String(o.total || 0),
        (o.status || '-').replace(/_/g, ' '),
        o.paymentStatus || '-',
        prettyPaymentMethod(o.paymentMethod),
      ]);
    });

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Sholok_Report_${startDate}_${endDate}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('CSV generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
