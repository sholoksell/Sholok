import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    visibility: { type: String, enum: ["public", "private", "unlisted"], default: "private" },
  },
  { timestamps: true }
);

playlistSchema.index({ owner: 1 });

export default mongoose.model("Playlist", playlistSchema);
