const mongoose = require("mongoose");

/**
 * Banner — homepage banners managed by admin.
 * Slot determines placement (hero/promo/sidebar).
 */
const BannerSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    image:    { type: String, required: true },
    mobileImage: { type: String, default: "" },
    link:     { type: String, default: "" },
    cta:      { type: String, default: "Shop now" },
    slot:     { type: String, enum: ["hero", "promo", "sidebar", "category"], default: "hero", index: true },
    order:    { type: Number, default: 0 },
    bgColor:  { type: String, default: "" },
    textColor:{ type: String, default: "" },
    startsAt: { type: Date, default: Date.now },
    endsAt:   { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", BannerSchema);
