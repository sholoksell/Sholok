import express from "express";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getCompanies);
router.get("/:id", getCompanyById);

// Admin / Super Admin
router.post("/", protect, authorize("admin", "super_admin"), createCompany);
router.put("/:id", protect, authorize("admin", "super_admin"), updateCompany);
router.delete("/:id", protect, authorize("super_admin"), deleteCompany);

export default router;
