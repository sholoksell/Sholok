const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  store:    { type: mongoose.Schema.Types.ObjectId, ref: "Store",   required: true },
  name:     String,
  image:    String,
  price:    Number,
  quantity: { type: Number, default: 1, min: 1 },
  variant:  { color: String, size: String },
});

const CartSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items:     [CartItemSchema],
    coupon:    { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponCode:String,
    discount:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.virtual("itemsTotal").get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

module.exports = mongoose.model("Cart", CartSchema);
