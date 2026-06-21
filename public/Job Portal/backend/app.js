import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import adminPanelRoutes from "./routes/adminPanelRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB connection is ready before handling any request (serverless cold starts)
app.use((req, res, next) => {
  connectDB().then(() => next()).catch((err) => {
    res.status(503).json({ message: "Database unavailable", error: err.message });
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/admin-panel", adminPanelRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
