const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    store:    { type: mongoose.Schema.Types.ObjectId, ref: "Store",   required: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    order:    { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    title:    { type: String, maxlength: 200 },
    body:     { type: String, required: true, maxlength: 2000 },
    images:   [String],
    helpful:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerifiedPurchase: { type: Boolean, default: false },
    sellerReply: {
      text:      String,
      repliedAt: Date,
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// After saving, update product's average rating
ReviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: this.product, status: "approved" } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(this.product, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count":   stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", ReviewSchema);
