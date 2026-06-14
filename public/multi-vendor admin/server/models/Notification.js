const mongoose = require("mongoose");

/**
 * Notification — system, order, marketing alerts
 */
const NotificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:    { type: String, enum: ["order", "system", "promo", "chat", "review", "store"], default: "system" },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String, default: "" },
    meta:    { type: mongoose.Schema.Types.Mixed },
    isRead:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
