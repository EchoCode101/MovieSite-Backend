import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { ReportsService } from "./reports.service.js";
import logger from "../../config/logger.js";
import type {
    CreateReportInput,
    UpdateReportStatusInput,
} from "./reports.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const reportsService = new ReportsService();

/**
 * Create a new report (authenticated)
 */
export async function createReport(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        const report = await reportsService.createReport(
            req.body as CreateReportInput,
            userId
        );
        const response: ApiResponse<typeof report> = {
            success: true,
            message: "Report submitted successfully",
            data: report,
        };
        res.status(201).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error creating report:", error);
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to create report")
        );
    }
}

/**
 * Get all reports (admin only)
 */
export async function getAllReports(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const reports = await reportsService.getAllReports();
        const response: ApiResponse<typeof reports> = {
            success: true,
            message: "Reports retrieved successfully",
            data: reports,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching reports:", error);
        next(createError(500, err.message || "Failed to fetch reports"));
    }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const report = await reportsService.updateReportStatus(
            req.params.id,
            req.body as UpdateReportStatusInput
        );
        const response: ApiResponse<typeof report> = {
            success: true,
            message: "Report status updated successfully",
            data: report,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error updating report status:", error);
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to update report status")
        );
    }
}

