import express from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
  getAllUsers,
  getPaginatedUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
} from "./userController.js";
import {
  authenticateAdminToken,
  authenticateToken,
  limiter,
} from "../auth/authMiddleware.js";
import {
  profileRoute,
  updateProfile,
  fetchVideoUrl,
  saveVideoUrl,
  getUserVideos,
  deleteUserVideo,
  subscription_plan,
} from "./profileRoutes.js";
import { restPassword } from "./restUserPasswordRoute.js";

const router = express.Router();

// --- Auth Routes ---
router.post("/signup", limiter, signup);
router.post("/login", limiter, login);
router.post("/logout", authenticateToken, limiter, logout);
router.post("/forgotPassword", limiter, forgotPassword);
router.post("/forgotPassword/reset/:token", limiter, restPassword);

// --- Profile Routes (Me) ---
router.get("/me", authenticateToken, limiter, profileRoute); // Alias for /profile
router.get("/profile", authenticateToken, limiter, profileRoute); // Deprecated alias
router.put("/me", authenticateToken, limiter, updateProfile); // Alias for /profile
router.put("/profile", authenticateToken, limiter, updateProfile); // Deprecated alias
router.put("/subscription_plan", authenticateToken, limiter, subscription_plan);

// --- My Videos Routes ---
router.post("/saveVideoUrl", authenticateToken, limiter, saveVideoUrl);
router.get("/videos", authenticateToken, limiter, getUserVideos);
router.delete("/videos/:id", authenticateToken, limiter, deleteUserVideo);
router.get(
  "/fetchVideoUrl/:video_id",
  authenticateToken,
  limiter,
  fetchVideoUrl
);

// --- User Management Routes (Public/Admin) ---
router.get("/", authenticateAdminToken, getAllUsers); // Admin only
router.get("/paginated", authenticateToken, getPaginatedUsers); // Auth required
router.post("/", authenticateAdminToken, createUser); // Admin only
router.get("/:id", getUserById); // Public (with sensitive data filtering)
router.put("/:id", authenticateToken, updateUserById); // Owner/Admin only
router.delete("/:id", authenticateAdminToken, deleteUserById); // Admin only

export default router;
