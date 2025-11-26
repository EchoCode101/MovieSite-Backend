import { Router } from "express";
import { authenticateToken, authenticateAdminToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
    createReport,
    getAllReports,
    updateReportStatus,
} from "../modules/reports/reports.controller.js";
import {
    createReportSchema,
    updateReportStatusSchema,
} from "../modules/reports/reports.validators.js";

const router = Router();

// Create report (authenticated)
router.post(
    "/",
    authenticateToken,
    validateRequest(createReportSchema, "body"),
    createReport,
);

// Get all reports (admin only)
router.get("/", authenticateAdminToken, getAllReports);

// Update report status (admin only)
router.put(
    "/:id",
    authenticateAdminToken,
    validateRequest(updateReportStatusSchema, "body"),
    updateReportStatus,
);

export default router;


