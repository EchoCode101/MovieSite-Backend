import express from "express";
import {
  getAllUsers,
  updateSubscription,
  dashboard,
  adminSignup,
  adminLogin,
  adminLogout,
  forgotPassword,
} from "./adminController.js";
import { authenticateAdminToken, limiter } from "../auth/authMiddleware.js";
import { restPasswordRoute } from "./restAdminPasswordRoute.js";

const router = express.Router();

router.post("/forgotPassword", limiter, forgotPassword);
router.post("/forgotPassword/reset/:token", limiter, restPasswordRoute);
router.post("/signup", limiter, adminSignup);
router.post("/login", adminLogin);
router.post("/logout", authenticateAdminToken, adminLogout);
router.get("/users", authenticateAdminToken, limiter, getAllUsers);
router.get("/dashboard", authenticateAdminToken, limiter, dashboard);
router.put(
  "/subscription",
  authenticateAdminToken,
  limiter,
  updateSubscription
);

export default router;
