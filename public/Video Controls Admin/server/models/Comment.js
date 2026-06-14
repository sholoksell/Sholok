import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    likes: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ video: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);
