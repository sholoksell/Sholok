const mongoose = require("mongoose");

/**
 * Platform-wide settings (singleton document — only one row).
 * Manages commission rate, support contacts, payment toggles, etc.
 */
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },

    siteName:        { type: String, default: "Sholok eCommerce" },
    siteTagline:     { type: String, default: "Bangladesh's Smart Multi-Vendor Marketplace" },
    supportEmail:    { type: String, default: "support@sholok.store" },
    supportPhone:    { type: String, default: "+880 1700-000000" },

    // Commission
    commissionPercent: { type: Number, default: 8, min: 0, max: 100 },

    // Shipping
    freeShippingThreshold: { type: Number, default: 11000 },
    flatShippingRate:      { type: Number, default: 880 },

    // Payments
    enableStripe:     { type: Boolean, default: true },
    enableSslcommerz: { type: Boolean, default: true },
    enableCod:        { type: Boolean, default: true },

    // Currency
    currency:        { type: String, default: "BDT" },
    currencySymbol:  { type: String, default: "৳" },

    // SMTP test status
    emailVerified:   { type: Boolean, default: false },

    // Social
    facebook: { type: String, default: "" },
    twitter:  { type: String, default: "" },
    instagram:{ type: String, default: "" },
    youtube:  { type: String, default: "" },

    // Maintenance
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SettingSchema.statics.get = async function () {
  let s = await this.findOne({ key: "global" });
  if (!s) s = await this.create({ key: "global" });
  return s;
};

module.exports = mongoose.model("Setting", SettingSchema);
