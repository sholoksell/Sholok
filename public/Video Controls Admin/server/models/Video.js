import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 5000 },
    titleBn: { type: String, default: "", trim: true, maxlength: 200 },
    titleEn: { type: String, default: "", trim: true, maxlength: 200 },
    descriptionBn: { type: String, default: "", maxlength: 5000 },
    descriptionEn: { type: String, default: "", maxlength: 5000 },
    // Local file storage paths
    videoPath: { type: String, required: true },
    thumbnailPath: { type: String, default: "" },
    // Video metadata
    duration: { type: String, default: "0:00" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "video/mp4" },
    // Relations
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Stats
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    // Categorization
    category: {
      type: String,
      enum: ["Music", "Gaming", "Movies", "Tech", "Food", "Travel", "Fitness", "K-Drama", "Live", "News", "Comedy", "Education", "Entertainment", "Software Related", "Natural Related", "Other"],
      default: "Other",
    },
    tags: [{ type: String, trim: true }],
    // Type
    isShort: { type: Boolean, default: false },
    // Status & moderation
    status: { type: String, enum: ["processing", "active", "removed", "private", "unlisted"], default: "active" },
    // Video Controls Admin field
    videoControlsAdmin: {
      autoplay: { type: Boolean, default: true },
      allowDownload: { type: Boolean, default: false },
      allowEmbed: { type: Boolean, default: true },
      ageRestricted: { type: Boolean, default: false },
      isFeatured: { type: Boolean, default: false },
      isPinned: { type: Boolean, default: false },
      qualityOptions: [{ type: String }],
      maxResolution: { type: String, default: "1080p" },
      watermark: { type: Boolean, default: false },
      commentsEnabled: { type: Boolean, default: true },
      likesVisible: { type: Boolean, default: true },
      viewCountVisible: { type: Boolean, default: true },
      monetizationEnabled: { type: Boolean, default: false },
      adPlacement: { type: String, enum: ["none", "pre-roll", "mid-roll", "post-roll"], default: "none" },
      priority: { type: Number, default: 0, min: 0, max: 100 },
      moderationStatus: { type: String, enum: ["pending", "approved", "rejected", "flagged"], default: "approved" },
      moderationNotes: { type: String, default: "" },
      restrictedRegions: [{ type: String }],
    },
  },
  { timestamps: true }
);

videoSchema.index({ title: "text", description: "text", tags: "text" });
videoSchema.index({ category: 1, status: 1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });

export default mongoose.model("Video", videoSchema);
