import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Channel from "../models/Channel.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, displayName, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = await User.create({
      username,
      email,
      password,
      displayName: displayName || username,
      role: role === "creator" ? "creator" : "viewer",
    });

    // Auto-create channel for all users
    await Channel.create({
      owner: user._id,
      name: user.displayName,
      handle: user.username.toLowerCase(),
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.isActive) return res.status(403).json({ error: "Account disabled" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let channel = await Channel.findOne({ owner: req.user._id });
    // Auto-create channel if missing (for users registered before this fix)
    if (!channel && user) {
      channel = await Channel.create({
        owner: user._id,
        name: user.displayName || user.username,
        handle: user.username.toLowerCase(),
      });
    }
    res.json({ user, channel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get watch history
router.get("/history", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "watchHistory.video",
      populate: [
        { path: "channel", select: "name handle avatar" },
        { path: "uploader", select: "username displayName avatar" },
      ],
    });
    // Return newest first, filter out deleted videos
    const history = (user.watchHistory || [])
      .filter((h) => h.video && h.video.status !== "removed")
      .reverse()
      .map((h) => ({ ...h.video.toObject(), watchedAt: h.watchedAt }));
    res.json({ videos: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear watch history
router.delete("/history", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { watchHistory: [] } });
    res.json({ message: "History cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put("/me", auth, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { displayName, avatar }, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
