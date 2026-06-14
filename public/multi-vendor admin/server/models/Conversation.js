const mongoose = require("mongoose");

/**
 * Conversation between a buyer and a seller (about a product/store).
 * Messages are stored in the Message collection (separate for scalability).
 */
const ConversationSchema = new mongoose.Schema(
  {
    buyer:        { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    seller:       { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    store:        { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    product:      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    lastMessage:  { type: String, default: "" },
    lastSender:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unreadBuyer:  { type: Number, default: 0 },
    unreadSeller: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ConversationSchema.index({ buyer: 1, seller: 1, store: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", ConversationSchema);
