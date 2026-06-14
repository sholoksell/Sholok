import { Router } from "express";
import Playlist from "../models/Playlist.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Get all playlists for current user
router.get("/", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .populate({
        path: "videos",
        select: "title thumbnailPath duration views createdAt status",
        populate: { path: "channel", select: "name handle avatar" },
      });
    res.json({ playlists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create playlist
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, visibility } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Playlist name is required" });

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description || "",
      owner: req.user._id,
      visibility: visibility || "private",
    });
    res.status(201).json({ playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single playlist
router.get("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({
      path: "videos",
      populate: [
        { path: "channel", select: "name handle avatar" },
        { path: "uploader", select: "username displayName avatar" },
      ],
    });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (String(playlist.owner) !== String(req.user._id) && playlist.visibility === "private") {
      return res.status(403).json({ error: "Not authorized" });
    }
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add video to playlist
router.post("/:id/videos", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (String(playlist.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { videoId } = req.body;
    if (!videoId) return res.status(400).json({ error: "videoId is required" });

    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({ error: "Video already in playlist" });
    }

    playlist.videos.push(videoId);
    await playlist.save();
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove video from playlist
router.delete("/:id/videos/:videoId", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (String(playlist.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    playlist.videos = playlist.videos.filter((v) => String(v) !== req.params.videoId);
    await playlist.save();
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update playlist
router.put("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (String(playlist.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { name, description, visibility } = req.body;
    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (visibility) playlist.visibility = visibility;
    await playlist.save();
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (String(playlist.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await playlist.deleteOne();
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
