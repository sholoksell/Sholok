const Store   = require("../models/Store");
const Product = require("../models/Product");

// @GET /api/v1/stores  (public)
exports.getStores = async (req, res) => {
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 20;
  const filter = { isActive: true };
  if (req.query.featured)  filter.isFeatured = true;
  if (req.query.category)  filter.category   = req.query.category;
  if (req.query.search)    filter.name       = { $regex: req.query.search, $options: "i" };

  const [stores, total] = await Promise.all([
    Store.find(filter).populate("owner", "name avatar").sort({ isFeatured: -1, "stats.rating": -1 }).skip((page - 1) * limit).limit(limit),
    Store.countDocuments(filter),
  ]);
  res.json({ success: true, count: stores.length, total, stores });
};

// @GET /api/v1/stores/:slug  (public — by smartStore slug)
exports.getStoreBySlug = async (req, res) => {
  const store = await Store.findOne({ smartStore: req.params.slug, isActive: true }).populate("owner", "name avatar");
  if (!store) return res.status(404).json({ success: false, message: "Store not found." });

  await Store.findByIdAndUpdate(store._id, { $inc: { "stats.views": 1 } });

  const products = await Product.find({ store: store._id, isActive: true })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(20);

  res.json({ success: true, store, products });
};

// @GET /api/v1/stores/me  (seller)
exports.getMyStore = async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id }).populate("owner", "name email avatar");
  if (!store) return res.status(404).json({ success: false, message: "You don't have a store." });
  res.json({ success: true, store });
};

// @PUT /api/v1/stores/me  (seller)
exports.updateMyStore = async (req, res) => {
  const allowed = ["name", "description", "logo", "banner", "category", "tags", "contact", "address", "socialLinks", "policies", "layout"];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const store = await Store.findOneAndUpdate({ owner: req.user.id }, updates, { new: true, runValidators: true });
  if (!store) return res.status(404).json({ success: false, message: "Store not found." });
  res.json({ success: true, store });
};

// @GET /api/v1/stores/featured  (public)
exports.getFeaturedStores = async (req, res) => {
  const stores = await Store.find({ isFeatured: true, isActive: true })
    .populate("owner", "name avatar")
    .sort({ "stats.rating": -1 })
    .limit(10);
  res.json({ success: true, stores });
};
