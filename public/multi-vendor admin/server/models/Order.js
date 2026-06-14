const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  store:     { type: mongoose.Schema.Types.ObjectId, ref: "Store",   required: true },
  name:      { type: String, required: true },
  image:     { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  variant:   { color: String, size: String },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:       [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      state:    String,
      zip:      String,
      country:  { type: String, default: "Bangladesh" },
    },
    paymentMethod:  { type: String, enum: ["stripe", "sslcommerz", "cod"], required: true },
    paymentStatus:  { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentResult:  { transactionId: String, status: String, paidAt: Date },
    orderStatus:    { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"], default: "pending" },
    statusHistory:  [{ status: String, note: String, updatedAt: { type: Date, default: Date.now } }],
    itemsTotal:     { type: Number, required: true },
    shippingCost:   { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    couponCode:     String,
    totalAmount:    { type: Number, required: true },
    note:           String,
    deliveredAt:    Date,
    cancelledAt:    Date,
    trackingNumber: String,
    courier:        String,
  },
  { timestamps: true }
);

// Auto-generate order number
OrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${ts}-${rand}`;
  }
  next();
});

OrderSchema.index({ customer: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
