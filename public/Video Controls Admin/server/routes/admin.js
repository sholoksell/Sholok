import { Router } from "express";
import User from "../models/User.js";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import Comment from "../models/Comment.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

// Admin stats
router.get("/stats", auth, requireRole("admin"), async (req, res) => {
  try {
    const [totalUsers, totalVideos, totalChannels, totalComments] = await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      Channel.countDocuments(),
      Comment.countDocuments(),
    ]);

    const totalViews = await Video.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);
    const activeReports = await Video.countDocuments({ "videoControlsAdmin.moderationStatus": "flagged" });

    res.json({
      totalUsers,
      totalVideos,
      totalChannels,
      totalComments,
      totalViews: totalViews[0]?.total || 0,
      activeReports,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin)
router.get("/users", auth, requireRole("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments();
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active status
router.put("/users/:id/toggle", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put("/users/:id/role", auth, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["viewer", "creator", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Create channel if promoted to creator
    if (role === "creator") {
      const existingChannel = await Channel.findOne({ owner: user._id });
      if (!existingChannel) {
        await Channel.create({ owner: user._id, name: user.displayName || user.username, handle: user.username.toLowerCase() });
      }
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all videos for admin
router.get("/videos", auth, requireRole("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const videos = await Video.find(query)
      .populate("channel", "name handle avatar")
      .populate("uploader", "username displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);
    res.json({ videos, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update video controls admin (admin only)
router.put("/videos/:id/controls", auth, requireRole("admin"), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const controls = req.body;
    Object.keys(controls).forEach((key) => {
      if (video.videoControlsAdmin[key] !== undefined) {
        video.videoControlsAdmin[key] = controls[key];
      }
    });

    await video.save();
    res.json({ video });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove video (admin)
router.delete("/videos/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { status: "removed" }, { new: true });
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json({ message: "Video removed", video });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flagged/reported videos
router.get("/flagged", auth, requireRole("admin"), async (req, res) => {
  try {
    const videos = await Video.find({ "videoControlsAdmin.moderationStatus": "flagged" })
      .populate("channel", "name handle")
      .populate("uploader", "username displayName")
      .sort({ createdAt: -1 });
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
