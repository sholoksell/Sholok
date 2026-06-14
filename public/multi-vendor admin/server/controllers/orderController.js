const Order   = require("../models/Order");
const Product = require("../models/Product");
const Cart    = require("../models/Cart");
const Coupon  = require("../models/Coupon");
const Store   = require("../models/Store");

// @POST /api/v1/orders  (customer)
exports.placeOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, note } = req.body;

  if (!items?.length) return res.status(400).json({ success: false, message: "Order must have at least one item." });

  // Validate stock and calculate totals
  let itemsTotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive)
      return res.status(400).json({ success: false, message: `Product '${item.name}' is unavailable.` });
    if (product.stock < item.quantity)
      return res.status(400).json({ success: false, message: `Insufficient stock for '${product.name}'.` });
    itemsTotal += product.price * item.quantity;
  }

  // Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && coupon.expiresAt > Date.now() && itemsTotal >= coupon.minOrderValue) {
      discount = coupon.type === "percentage"
        ? Math.min((itemsTotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
        : coupon.value;
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }
  }

  const shippingCost = itemsTotal >= 11000 ? 0 : 880;
  const totalAmount  = itemsTotal - discount + shippingCost;

  const order = await Order.create({
    customer:   req.user.id,
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    discount,
    itemsTotal,
    shippingCost,
    totalAmount,
    note,
    statusHistory: [{ status: "pending", note: "Order placed" }],
  });

  // Decrease stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
    await Store.findByIdAndUpdate(item.store, { $inc: { "stats.totalOrders": 1 } });
  }

  // Clear cart
  await Cart.findOneAndDelete({ user: req.user.id });

  res.status(201).json({ success: true, order });
};

// @GET /api/v1/orders/my-orders  (customer)
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user.id })
    .populate("items.product", "name images")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
};

// @GET /api/v1/orders/:id  (customer/seller/admin)
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer",       "name email phone")
    .populate("items.product",  "name images price")
    .populate("items.store",    "name smartStore logo");

  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  // Customer can only see their own orders
  if (req.user.role === "customer" && order.customer._id.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: "Not authorized." });

  res.json({ success: true, order });
};

// @PUT /api/v1/orders/:id/status  (seller/admin)
exports.updateOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, courier } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  order.orderStatus = status;
  order.statusHistory.push({ status, note });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courier)        order.courier = courier;
  if (status === "delivered") { order.deliveredAt = Date.now(); order.paymentStatus = "paid"; }
  if (status === "cancelled") order.cancelledAt = Date.now();

  await order.save();
  res.json({ success: true, order });
};

// @GET /api/v1/orders/seller  (seller)
exports.getSellerOrders = async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  if (!store) return res.status(404).json({ success: false, message: "Store not found." });

  const orders = await Order.find({ "items.store": store._id })
    .populate("customer",      "name email phone")
    .populate("items.product", "name images")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
};

// @GET /api/v1/orders (admin only)
exports.getAllOrders = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;

  const filter = {};
  if (req.query.status)        filter.orderStatus   = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, count: orders.length, total, totalPages: Math.ceil(total / limit), orders });
};
