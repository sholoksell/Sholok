const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const Order   = require("../models/Order");
const Product = require("../models/Product");
const Store   = require("../models/Store");

// @GET /api/v1/analytics/seller  — seller dashboard stats
router.get("/seller", protect, authorize("seller"), async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  if (!store) return res.status(404).json({ success: false, message: "Store not found." });

  const days = Number(req.query.days) || 30;
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [salesByDay, topProducts, totalRevAgg, orderStatuses] = await Promise.all([
    Order.aggregate([
      { $match: { "items.store": store._id, createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.find({ store: store._id }).sort({ sold: -1 }).limit(5).select("name images price sold ratings"),
    Order.aggregate([
      { $match: { "items.store": store._id, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { "items.store": store._id } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    storeStats: store.stats,
    totalRevenue: totalRevAgg[0]?.total || 0,
    salesByDay,
    topProducts,
    orderStatuses,
  });
});

module.exports = router;
