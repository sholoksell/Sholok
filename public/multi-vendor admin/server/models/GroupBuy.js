const mongoose = require("mongoose");

const GroupBuySchema = new mongoose.Schema(
  {
    product:       { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title:         { type: String, required: true },
    description:   String,
    groupPrice:    { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    minMembers:    { type: Number, required: true, min: 2 },
    maxMembers:    Number,
    currentMembers:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startsAt:      { type: Date, default: Date.now },
    endsAt:        { type: Date, required: true },
    status:        { type: String, enum: ["open", "success", "failed", "cancelled"], default: "open" },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupBuy", GroupBuySchema);
