const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:         { type: String, enum: ["percentage", "fixed"], required: true },
    value:        { type: Number, required: true, min: 0 },
    minOrderValue:{ type: Number, default: 0 },
    maxDiscount:  { type: Number, default: null },
    store:        { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null },  // null = platform-wide
    categories:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    products:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    usageLimit:   { type: Number, default: null },  // null = unlimited
    usedCount:    { type: Number, default: 0 },
    userLimit:    { type: Number, default: 1 },     // uses per user
    usedBy:       [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, count: Number }],
    isActive:     { type: Boolean, default: true },
    startsAt:     { type: Date, default: Date.now },
    expiresAt:    { type: Date, required: true },
    description:  String,
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
