import express from "express";
import {
  createReport,
  getAllReports,
  updateReportStatus,
} from "./reports.controller.js";
import {
  authenticateToken,
  authenticateAdminToken,
} from "../auth/authMiddleware.js";

const router = express.Router();

// Public (Authenticated) Routes
router.post("/", authenticateToken, createReport);

// Admin Routes
router.get("/", authenticateAdminToken, getAllReports);
router.put("/:id/status", authenticateAdminToken, updateReportStatus);

export default router;
