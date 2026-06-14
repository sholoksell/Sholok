import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    handle: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "", maxlength: 2000 },
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },
    subscriberCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Channel", channelSchema);
