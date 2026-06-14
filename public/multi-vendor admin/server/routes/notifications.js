const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");

// GET /api/v1/notifications  — list mine
router.get("/", protect, async (req, res) => {
  const notes = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
  res.json({ success: true, notifications: notes, unreadCount });
});

// PUT /api/v1/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isRead: true });
  res.json({ success: true });
});

// PUT /api/v1/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

// DELETE /api/v1/notifications/:id
router.delete("/:id", protect, async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true });
});

module.exports = router;
