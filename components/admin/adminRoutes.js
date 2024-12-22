import express from "express";
import {
  getAllUsers,
  updateSubscription,
  adminSignup,
  adminLogin,
  adminLogout,
  forgotPassword,
  getDashboardStats,
} from "./adminController.js";
import { authenticateAdminToken, limiter } from "../auth/authMiddleware.js";
import { restAdminPassword } from "./restAdminPasswordRoute.js";

const router = express.Router();

router.post("/forgotPassword", limiter, forgotPassword);
router.post("/signup", limiter, adminSignup);
router.post("/login", adminLogin);
router.post("/logout", authenticateAdminToken, adminLogout);
router.get("/users", authenticateAdminToken, limiter, getAllUsers);
router.get("/stats", authenticateAdminToken, getDashboardStats);
router.put(
  "/subscription",
  authenticateAdminToken,
  limiter,
  updateSubscription
);
router.post("/forgotPassword/reset/:token", limiter, restAdminPassword);

export default router;
