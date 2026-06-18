const mongoose = require("mongoose");

/**
 * SmartStore — each seller gets one store (inspired by Naver Smart Store).
 * The `smartStore` field is the slug/identifier for the store page.
 */
const StoreSchema = new mongoose.Schema(
  {
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    smartStore:  { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[a-z0-9-]+$/, "smartStore slug must be lowercase letters, numbers, and hyphens only"] },
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    nameBn:      { type: String, trim: true, maxlength: 100, default: "" },
    nameEn:      { type: String, trim: true, maxlength: 100, default: "" },
    description: { type: String, default: "", maxlength: 2000 },
    descriptionBn: { type: String, default: "", maxlength: 2000 },
    descriptionEn: { type: String, default: "", maxlength: 2000 },
    logo:        { type: String, default: "" },
    banner:      { type: String, default: "" },
    category:    { type: String, default: "General" },
    tags:        [String],
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    address: {
      street: String, city: String,
      state: String,  country: { type: String, default: "Bangladesh" },
    },
    socialLinks: {
      facebook:  String,
      instagram: String,
      twitter:   String,
    },
    policies: {
      returnPolicy:   { type: String, default: "7-day return policy" },
      shippingPolicy: { type: String, default: "Free shipping over ৳999" },
    },
    layout: {
      theme:         { type: String, default: "default" },
      primaryColor:  { type: String, default: "#6c47ff" },
      bannerStyle:   { type: String, default: "full" },
      featuredCount: { type: Number, default: 8 },
    },
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders:   { type: Number, default: 0 },
      totalRevenue:  { type: Number, default: 0 },
      totalReviews:  { type: Number, default: 0 },
      rating:        { type: Number, default: 0 },
      views:         { type: Number, default: 0 },
      followers:     { type: Number, default: 0 },
    },
    isActive:    { type: Boolean, default: true },
    isVerified:  { type: Boolean, default: false },
    isFeatured:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

StoreSchema.index({ smartStore: 1 });
StoreSchema.index({ owner: 1 });
StoreSchema.index({ isFeatured: -1, "stats.rating": -1 });

module.exports = mongoose.model("Store", StoreSchema);
