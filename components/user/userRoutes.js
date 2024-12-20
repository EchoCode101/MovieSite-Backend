import express from "express";
import { signup, login, logout, forgotPassword } from "./userController.js";
import {
  authenticateAdminToken,
  authenticateToken,
  limiter,
} from "../auth/authMiddleware.js";
import {
  profileRoute,
  fetchVideoUrl,
  saveVideoUrl,
  subscription_plan,
} from "./profileRoutes.js";
import { restPassword } from "./restUserPasswordRoute.js";

const router = express.Router();

router.post("/forgotPassword", limiter, forgotPassword);
router.post("/signup", limiter, signup);
router.post("/login", limiter, login);
router.get("/profile", authenticateToken, limiter, profileRoute);
router.post("/saveVideoUrl", authenticateAdminToken, limiter, saveVideoUrl);
router.put(
  "/subscription_plan",
  authenticateAdminToken,
  limiter,
  subscription_plan
);
router.post("/logout", authenticateToken, limiter, logout);

router.post("/forgotPassword/reset/:token", limiter, restPassword);
router.get(
  "/fetchVideoUrl/:video_id",
  authenticateToken,
  limiter,
  fetchVideoUrl
);

export default router;
