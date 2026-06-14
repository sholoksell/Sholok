import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorize("vendor", "admin", "super_admin"),
  getDashboardStats
);

export default router;
