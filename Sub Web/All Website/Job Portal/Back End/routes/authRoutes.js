import express from "express";
import { register, login, getMe, createAdmin, getUsers, toggleUserStatus, deleteUser } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/create-admin", protect, authorize("super_admin"), createAdmin);
router.get("/users", protect, authorize("admin", "super_admin"), getUsers);
router.put("/users/:id/toggle-status", protect, authorize("admin", "super_admin"), toggleUserStatus);
router.delete("/users/:id", protect, authorize("admin", "super_admin"), deleteUser);

export default router;
