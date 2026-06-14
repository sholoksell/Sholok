import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import channelRoutes from "./routes/channels.js";
import commentRoutes from "./routes/comments.js";
import adminRoutes from "./routes/admin.js";
import playlistRoutes from "./routes/playlists.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
  // Fix Like collection: drop ALL unique indexes that cause duplicate key errors
  try {
    const mongoose = (await import("mongoose")).default;
    const likesCollection = mongoose.connection.collection("likes");
    // Drop ALL indexes except _id
    await likesCollection.dropIndexes();
    // Remove any null video/comment fields from old data
    await likesCollection.updateMany({ video: null }, { $unset: { video: "" } });
    await likesCollection.updateMany({ comment: null }, { $unset: { comment: "" } });
    // Create simple non-unique query indexes for performance only
    await likesCollection.createIndex({ user: 1, video: 1 });
    await likesCollection.createIndex({ user: 1, comment: 1 });
    console.log("✅ Like indexes fixed");
  } catch (e) {
    console.log("Like index fix skipped:", e.message);
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: "Too many requests, please try again later" },
});

// Middleware
app.use(cors({ origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], credentials: true }));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically (for thumbnails etc)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Seed admin user helper
app.post("/api/seed-admin", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const Channel = (await import("./models/Channel.js")).default;
    
    const existing = await User.findOne({ email: "admin@vivora.com" });
    if (existing) return res.json({ message: "Admin user already exists", user: existing });

    const admin = await User.create({
      username: "admin",
      email: "admin@vivora.com",
      password: "admin123456",
      displayName: "Platform Admin",
      role: "admin",
    });

    await Channel.create({
      owner: admin._id,
      name: "Sholok Watching Admin",
      handle: "admin",
    });

    res.json({ message: "Admin user created", user: admin, credentials: { email: "admin@vivora.com", password: "admin123456" } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Sholok Watching Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🎬 Video streaming at http://localhost:${PORT}/api/videos/stream/:id\n`);
});
