import { Router } from "express";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import Notification from "../models/Notification.js";
import { auth, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Get comments for a video
router.get("/video/:videoId", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Top-level comments
    const comments = await Comment.find({ video: req.params.videoId, parentComment: null })
      .populate("user", "username displayName avatar")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("user", "username displayName avatar")
          .sort({ createdAt: 1 })
          .limit(5);
        return { ...comment.toObject(), replies };
      })
    );

    const total = await Comment.countDocuments({ video: req.params.videoId, parentComment: null });

    res.json({ comments: commentsWithReplies, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post("/", auth, async (req, res) => {
  try {
    const { videoId, text, parentComment } = req.body;
    if (!videoId || !text?.trim()) return res.status(400).json({ error: "Video ID and text required" });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (!video.videoControlsAdmin?.commentsEnabled) {
      return res.status(403).json({ error: "Comments are disabled for this video" });
    }

    const comment = await Comment.create({
      video: videoId,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentComment || null,
    });

    video.commentCount += 1;
    await video.save();

    // Notify video uploader about the comment
    if (String(video.uploader) !== String(req.user._id)) {
      try {
        await Notification.create({
          recipient: video.uploader,
          type: parentComment ? "reply" : "comment",
          title: `${req.user.displayName || req.user.username} ${parentComment ? "replied on" : "commented on"} your video`,
          message: text.trim().substring(0, 100),
          video: videoId,
          fromUser: req.user._id,
          comment: comment._id,
        });
      } catch (e) { /* ignore */ }
    }

    const populated = await Comment.findById(comment._id).populate("user", "username displayName avatar");
    res.status(201).json({ comment: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (String(comment.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete replies too
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    await Video.findByIdAndUpdate(comment.video, { $inc: { commentCount: -1 } });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a comment
router.post("/:id/like", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.likes += 1;
    await comment.save();

    res.json({ likes: comment.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
