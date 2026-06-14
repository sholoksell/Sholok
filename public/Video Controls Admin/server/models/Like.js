import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    type: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: true, autoIndex: false }
);

export default mongoose.model("Like", likeSchema);
