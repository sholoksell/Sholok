const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  name:   { type: String, required: true },   // e.g. "Color", "Size"
  values: [{ type: String, required: true }],  // e.g. ["Red", "Blue"]
});

const ProductSchema = new mongoose.Schema(
  {
    store:       { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    seller:      { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    name:        { type: String, required: true, trim: true, maxlength: 300 },
    slug:        { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 10000 },
    price:       { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName:{ type: String, required: true },
    subCategory: { type: String, default: "" },
    brand:       { type: String, default: "" },
    images:      [{ url: String, public_id: String }],
    variants:    [VariantSchema],
    stock:       { type: Number, required: true, default: 0, min: 0 },
    sold:        { type: Number, default: 0 },
    sku:         { type: String, default: "" },
    tags:        [String],
    badge:       { type: String, enum: ["", "New", "Bestseller", "Limited", "Sale", "Hot", "Trending"], default: "" },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSalePrice:   { type: Number, default: 0 },
    flashSaleEnds:    { type: Date },
    seasonalFor:      [{ type: String }],   // Bangladesh season IDs
    weight:     { type: Number, default: 0 },
    dimensions: { length: Number, width: Number, height: Number },
    ratings: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    seoTitle:       String,
    seoDescription: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-generate slug from name
ProductSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) + "-" + Date.now();
  }
  next();
});

// Virtual: discount %
ProductSchema.virtual("discountPercent").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

ProductSchema.index({ store: 1, isActive: 1 });
ProductSchema.index({ categoryName: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ "ratings.average": -1 });
ProductSchema.index({ "$**": "text" }); // full-text search

module.exports = mongoose.model("Product", ProductSchema);
