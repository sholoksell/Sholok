import { Router } from "express";
import fs from "fs";
import path from "path";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import Like from "../models/Like.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Subscription from "../models/Subscription.js";
import { auth, optionalAuth, requireRole } from "../middleware/auth.js";
import { uploadVideo } from "../middleware/upload.js";

const router = Router();

// Upload video (with file from local computer)
router.post(
  "/upload",
  auth,
  requireRole("creator", "admin"),
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.video?.[0]) return res.status(400).json({ error: "Video file is required" });

      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.thumbnail?.[0];

      let channel = await Channel.findOne({ owner: req.user._id });
      if (!channel) {
        channel = await Channel.create({
          owner: req.user._id,
          name: req.user.displayName || req.user.username,
          handle: req.user.username.toLowerCase(),
        });
      }

      const video = await Video.create({
        title: req.body.title || "Untitled Video",
        description: req.body.description || "",
        videoPath: videoFile.path,
        thumbnailPath: thumbnailFile?.path || "",
        duration: req.body.duration || "0:00",
        fileSize: videoFile.size,
        mimeType: videoFile.mimetype,
        channel: channel._id,
        uploader: req.user._id,
        category: req.body.category || "Other",
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        isShort: req.body.isShort === "true",
        videoControlsAdmin: {
          autoplay: true,
          allowDownload: false,
          allowEmbed: true,
          commentsEnabled: true,
          likesVisible: true,
          viewCountVisible: true,
          moderationStatus: "approved",
        },
      });

      channel.videoCount += 1;
      await channel.save();

      // Notify all subscribers about new video
      try {
        const subs = await Subscription.find({ channel: channel._id, notifications: true });
        if (subs.length > 0) {
          const notifications = subs
            .filter(s => String(s.subscriber) !== String(req.user._id))
            .map(s => ({
              recipient: s.subscriber,
              type: "new_video",
              title: `${channel.name} uploaded a new video`,
              message: video.title,
              video: video._id,
              channel: channel._id,
              fromUser: req.user._id,
            }));
          if (notifications.length > 0) await Notification.insertMany(notifications);
        }
      } catch (e) { /* don't fail upload if notification fails */ }

      const populated = await Video.findById(video._id).populate("channel", "name handle avatar").populate("uploader", "username displayName avatar");
      res.status(201).json({ video: populated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Stream video file (plays without internet once loaded)
router.get("/stream/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || video.status === "removed") return res.status(404).json({ error: "Video not found" });

    const videoPath = path.resolve(video.videoPath);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ error: "Video file not found on disk" });

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": video.mimeType,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": video.mimeType,
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get thumbnail
router.get("/thumbnail/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || !video.thumbnailPath) return res.status(404).json({ error: "Thumbnail not found" });

    const thumbPath = path.resolve(video.thumbnailPath);
    if (!fs.existsSync(thumbPath)) return res.status(404).json({ error: "Thumbnail file not found" });

    res.sendFile(thumbPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all videos (with filtering, search, pagination)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 24, category, search, sort = "newest", isShort } = req.query;
    const query = { status: "active" };

    if (category && category !== "All") query.category = category;
    if (isShort !== undefined) query.isShort = isShort === "true";
    if (search) query.$text = { $search: search };

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { views: -1 },
      trending: { views: -1, createdAt: -1 },
    };

    const videos = await Video.find(query)
      .populate("channel", "name handle avatar subscriberCount")
      .populate("uploader", "username displayName avatar")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get liked videos for current user
router.get("/liked", auth, async (req, res) => {
  try {
    const likes = await Like.find({ user: req.user._id, video: { $ne: null }, type: "like" })
      .sort({ createdAt: -1 })
      .populate({
        path: "video",
        populate: [
          { path: "channel", select: "name handle avatar subscriberCount" },
          { path: "uploader", select: "username displayName avatar" },
        ],
      });
    const videos = likes
      .filter((l) => l.video && l.video.status !== "removed")
      .map((l) => l.video);
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single video
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("channel", "name handle avatar subscriberCount")
      .populate("uploader", "username displayName avatar");

    if (!video || video.status === "removed") return res.status(404).json({ error: "Video not found" });

    // Increment views
    video.views += 1;
    await video.save();

    // Add to watch history if authenticated
    if (req.user) {
      const User = (await import("../models/User.js")).default;
      await User.findByIdAndUpdate(req.user._id, {
        $push: { watchHistory: { $each: [{ video: video._id }], $slice: -100 } },
      });
    }

    // Check if user liked
    let userReaction = null;
    if (req.user) {
      const like = await Like.findOne({ user: req.user._id, video: video._id });
      userReaction = like?.type || null;
    }

    res.json({ video, userReaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Dislike a video
router.post("/:id/react", auth, async (req, res) => {
  try {
    const { type } = req.body;
    console.log("[REACT] user:", req.user._id, "video:", req.params.id, "type:", type);
    if (!["like", "dislike"].includes(type)) return res.status(400).json({ error: "Invalid reaction type" });

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const existing = await Like.findOne({ user: req.user._id, video: video._id });
    console.log("[REACT] existing:", existing);

    if (existing) {
      if (existing.type === type) {
        // Remove reaction
        await existing.deleteOne();
        video[type === "like" ? "likes" : "dislikes"] = Math.max(0, (video[type === "like" ? "likes" : "dislikes"] || 0) - 1);
      } else {
        // Switch reaction
        video[existing.type === "like" ? "likes" : "dislikes"] = Math.max(0, (video[existing.type === "like" ? "likes" : "dislikes"] || 0) - 1);
        existing.type = type;
        await existing.save();
        video[type === "like" ? "likes" : "dislikes"] = (video[type === "like" ? "likes" : "dislikes"] || 0) + 1;
      }
    } else {
      // Delete any stale duplicates first, then create fresh
      await Like.deleteMany({ user: req.user._id, video: video._id });
      await Like.create({ user: req.user._id, video: video._id, type });
      video[type === "like" ? "likes" : "dislikes"] = (video[type === "like" ? "likes" : "dislikes"] || 0) + 1;

      // Notify video uploader about the like
      if (type === "like" && String(video.uploader) !== String(req.user._id)) {
        try {
          await Notification.create({
            recipient: video.uploader,
            type: "like",
            title: `${req.user.displayName || req.user.username} liked your video`,
            message: video.title,
            video: video._id,
            fromUser: req.user._id,
          });
        } catch (e) { /* ignore */ }
      }
    }

    await video.save();
    console.log("[REACT] success - likes:", video.likes, "dislikes:", video.dislikes);
    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (error) {
    console.error("[REACT] ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete video
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (String(video.uploader) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete files from disk
    if (video.videoPath && fs.existsSync(video.videoPath)) fs.unlinkSync(video.videoPath);
    if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) fs.unlinkSync(video.thumbnailPath);

    await video.deleteOne();

    await Channel.findByIdAndUpdate(video.channel, { $inc: { videoCount: -1 } });

    res.json({ message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update video
router.put("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (String(video.uploader) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { title, description, category, tags, status } = req.body;
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (tags) video.tags = tags;
    if (status) video.status = status;

    await video.save();
    const populated = await Video.findById(video._id).populate("channel", "name handle avatar").populate("uploader", "username displayName avatar");
    res.json({ video: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
