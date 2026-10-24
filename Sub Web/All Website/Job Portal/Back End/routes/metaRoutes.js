import express from "express";
import {
  getCategories,
  getLocations,
  getPublicStats,
  createCategory,
  createLocation,
} from "../controllers/metaController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/categories", getCategories);
router.get("/locations", getLocations);
router.get("/stats", getPublicStats);

// Admin
router.post("/categories", protect, authorize("admin", "super_admin"), createCategory);
router.post("/locations", protect, authorize("admin", "super_admin"), createLocation);

export default router;
