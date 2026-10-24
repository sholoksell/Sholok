import express from "express";
import {
  createJob,
  getApprovedJobs,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  sendToSuperAdmin,
  approveJob,
  rejectJob,
} from "../controllers/jobController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getApprovedJobs);

// Vendor
router.post("/", protect, authorize("vendor"), createJob);
router.get("/my-jobs", protect, authorize("vendor"), getMyJobs);

// Admin / Super Admin
router.get("/all", protect, authorize("admin", "super_admin"), getAllJobs);
router.put("/send-to-super-admin/:id", protect, authorize("admin"), sendToSuperAdmin);
router.put("/approve/:id", protect, authorize("admin", "super_admin"), approveJob);
router.put("/reject/:id", protect, authorize("super_admin", "admin"), rejectJob);

// Protected CRUD (order matters — specific routes above :id)
router.get("/:id", getJobById);
router.put("/:id", protect, authorize("vendor"), updateJob);
router.delete("/:id", protect, authorize("vendor", "admin", "super_admin"), deleteJob);

export default router;
