const mongoose = require("mongoose");

const FlashSaleSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    banner:     String,
    startsAt:   { type: Date, required: true },
    endsAt:     { type: Date, required: true },
    products:   [
      {
        product:        { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        salePrice:      Number,
        originalPrice:  Number,
        discountPercent:Number,
        stockLimit:     Number,
        soldCount:      { type: Number, default: 0 },
      },
    ],
    isActive:   { type: Boolean, default: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashSale", FlashSaleSchema);
