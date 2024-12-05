import express from "express";
import {
  getAllUsers,
  updateSubscription,
  dashboard,
} from "./adminController.js";
import { authenticateAdminToken, limiter } from "../auth/authMiddleware.js";

const router = express.Router();

router.get("/users", authenticateAdminToken, limiter, getAllUsers);
router.get("/dashboard", authenticateAdminToken, limiter, dashboard);
router.put(
  "/subscription",
  authenticateAdminToken,
  limiter,
  updateSubscription
);

export default router;
