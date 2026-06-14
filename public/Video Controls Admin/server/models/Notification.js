import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["new_video", "comment", "like", "subscribe", "reply", "system"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, default: "", maxlength: 500 },
    read: { type: Boolean, default: false },
    // Reference to related content
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
