const router  = require("express").Router();
const { protect } = require("../middleware/auth");
const User    = require("../models/User");

router.get("/",        protect, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select("name email role avatar isActive createdAt");
  res.json({ success: true, users });
});
router.get("/:id",     protect, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.json({ success: true, user });
});

module.exports = router;
