import express from "express";
import cors from "cors";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests, please try again later" },
});

// Middleware
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "https://sholok.vercel.app"],
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically (for thumbnails etc)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure DB connection is ready before handling any request (serverless cold starts)
app.use((req, res, next) => {
  connectDB().then(() => next()).catch((err) => {
    res.status(503).json({ error: "Database unavailable", message: err.message });
  });
});

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

export default app;
