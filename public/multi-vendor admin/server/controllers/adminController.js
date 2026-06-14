const User     = require("../models/User");
const Store    = require("../models/Store");
const Product  = require("../models/Product");
const Order    = require("../models/Order");
const Review   = require("../models/Review");
const Category = require("../models/Category");

// @GET /api/v1/admin/dashboard
exports.getDashboard = async (req, res) => {
  const [
    totalUsers, totalSellers, totalCustomers, totalAdmins,
    totalStores, totalProducts, totalOrders,
    totalRevenueAgg, pendingOrders, activeFlashSales,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "seller" }),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "admin" }),
    Store.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.countDocuments({ orderStatus: "pending" }),
    0, // flash sales placeholder
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  // Sales last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailySales = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: "paid" } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find().sort({ sold: -1 }).limit(5).select("name images price sold ratings");

  // Recent orders
  const recentOrders = await Order.find().populate("customer", "name email").sort({ createdAt: -1 }).limit(10);

  // Recent signups
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select("name email role createdAt avatar");

  res.json({
    success: true,
    stats: {
      totalUsers, totalSellers, totalCustomers, totalAdmins,
      totalStores, totalProducts, totalOrders, totalRevenue,
      pendingOrders, activeFlashSales,
    },
    dailySales,
    topProducts,
    recentOrders,
    recentUsers,
  });
};

// @GET /api/v1/admin/users
exports.getUsers = async (req, res) => {
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 20;
  const filter = {};
  if (req.query.role)   filter.role   = req.query.role;
  if (req.query.search) filter.$or    = [{ name: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }];
  if (req.query.active) filter.isActive = req.query.active === "true";

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, count: users.length, total, totalPages: Math.ceil(total / limit), users });
};

// @PUT /api/v1/admin/users/:id
exports.updateUser = async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.json({ success: true, user });
};

// @DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  await user.deleteOne();
  res.json({ success: true, message: "User deleted." });
};

// @GET /api/v1/admin/stores
exports.getStores = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const [stores, total] = await Promise.all([
    Store.find().populate("owner", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Store.countDocuments(),
  ]);
  res.json({ success: true, count: stores.length, total, totalPages: Math.ceil(total / limit), stores });
};

// @PUT /api/v1/admin/stores/:id
exports.updateStore = async (req, res) => {
  const { isActive, isVerified, isFeatured } = req.body;
  const store = await Store.findByIdAndUpdate(req.params.id, { isActive, isVerified, isFeatured }, { new: true });
  if (!store) return res.status(404).json({ success: false, message: "Store not found." });
  res.json({ success: true, store });
};

// @GET /api/v1/admin/products
exports.getProducts = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const filter = {};
  if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(filter).populate("store", "name smartStore").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, count: products.length, total, totalPages: Math.ceil(total / limit), products });
};

// @DELETE /api/v1/admin/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  res.json({ success: true, message: "Product deleted." });
};

// @GET /api/v1/admin/reviews
exports.getReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("user",    "name email avatar")
    .populate("product", "name images")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, count: reviews.length, reviews });
};

// @DELETE /api/v1/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Review deleted." });
};

// @GET /api/v1/admin/categories
exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 });
  res.json({ success: true, categories });
};

// @POST /api/v1/admin/categories
exports.createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
};

// @PUT /api/v1/admin/categories/:id
exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: "Category not found." });
  res.json({ success: true, category });
};

// @DELETE /api/v1/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Category deleted." });
};

// @GET /api/v1/admin/analytics/overview
exports.getAnalytics = async (req, res) => {
  const days = Number(req.query.days) || 30;
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [salesByDay, salesByCategory, topStores, orderStatuses] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.aggregate([
      { $group: { _id: "$categoryName", count: { $sum: 1 }, totalSold: { $sum: "$sold" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]),
    Store.find({ isActive: true }).sort({ "stats.totalRevenue": -1 }).limit(10).select("name smartStore logo stats"),
    Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
  ]);

  res.json({ success: true, salesByDay, salesByCategory, topStores, orderStatuses });
};
