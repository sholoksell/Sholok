const Product  = require("../models/Product");
const Store    = require("../models/Store");
const Category = require("../models/Category");

// ── Helper: build filter query from query string ──────────────
const buildFilter = (query) => {
  const filter = { isActive: true };
  if (query.category)  filter.categoryName = { $regex: new RegExp(query.category, "i") };
  if (query.store)     filter.store = query.store;
  if (query.brand)     filter.brand = { $regex: new RegExp(query.brand, "i") };
  if (query.badge)     filter.badge = query.badge;
  if (query.season)    filter.seasonalFor = query.season;
  if (query.featured)  filter.isFeatured = true;
  if (query.flashSale) filter.isFlashSale = true;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.search) filter.$text = { $search: query.search };
  return filter;
};

// @GET /api/v1/products
exports.getProducts = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const filter  = buildFilter(req.query);
  const sortMap = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { "ratings.average": -1 }, popular: { sold: -1 } };
  const sort    = sortMap[req.query.sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter).populate("store", "name smartStore logo").sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    products,
  });
};

// @GET /api/v1/products/:id
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("store",    "name smartStore logo banner description policies")
    .populate("category", "name slug");
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  // Increment view count
  await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json({ success: true, product });
};

// @POST /api/v1/products  (seller only)
exports.createProduct = async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  if (!store) return res.status(403).json({ success: false, message: "You don't have a store yet." });

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json({ success: false, message: "Invalid category." });

  const product = await Product.create({
    ...req.body,
    store:        store._id,
    seller:       req.user.id,
    categoryName: category.name,
  });

  // Update store & category product counts
  await Store.findByIdAndUpdate(store._id, { $inc: { "stats.totalProducts": 1 } });
  await Category.findByIdAndUpdate(category._id, { $inc: { productCount: 1 } });

  res.status(201).json({ success: true, product });
};

// @PUT /api/v1/products/:id  (seller/admin)
exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  if (req.user.role !== "admin" && product.seller.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: "Not authorized." });

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, product });
};

// @DELETE /api/v1/products/:id  (seller/admin)
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  if (req.user.role !== "admin" && product.seller.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: "Not authorized." });

  await product.deleteOne();
  await Store.findByIdAndUpdate(product.store, { $inc: { "stats.totalProducts": -1 } });
  res.json({ success: true, message: "Product deleted." });
};

// @GET /api/v1/products/seller/my-products  (seller)
exports.getSellerProducts = async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  if (!store) return res.status(404).json({ success: false, message: "Store not found." });

  const products = await Product.find({ store: store._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, products });
};

// @GET /api/v1/products/featured
exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("store", "name smartStore logo")
    .sort({ "ratings.average": -1 })
    .limit(20);
  res.json({ success: true, products });
};
