import { Router } from "express";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Get notifications for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("fromUser", "username displayName avatar")
      .populate("video", "title thumbnailPath")
      .populate("channel", "name handle avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({ notifications, total, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count only
router.get("/unread-count", auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark single notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all notifications
router.delete("/", auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
