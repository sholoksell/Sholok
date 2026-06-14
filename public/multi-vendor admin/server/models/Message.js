const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:         { type: String, default: "" },
    image:        { type: String, default: "" },
    isRead:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
