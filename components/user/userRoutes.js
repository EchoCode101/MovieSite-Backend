import express from "express";
import { signup, login, logout } from "./userController.js";
import {
  authenticateAdminToken,
  authenticateToken,
  limiter,
} from "../auth/authMiddleware.js";
import { profileRoutes, fetchVideoUrl, saveVideoUrl } from "./profileRoutes.js";

const router = express.Router();

router.post("/signup", limiter, signup);
router.post("/login", limiter, login);
router.get("/profile", authenticateToken, limiter, profileRoutes);
// router.post("/fetchVideoUrl", authenticateToken, limiter, fetchVideoUrl);
router.get("/fetchVideoUrl/:video_id", authenticateToken, limiter, fetchVideoUrl);
router.post("/saveVideoUrl", authenticateAdminToken, limiter, saveVideoUrl);
router.post("/logout", authenticateToken, limiter, logout);

export default router;
