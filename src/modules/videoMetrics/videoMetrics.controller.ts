import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { VideoMetricsService } from "./videoMetrics.service.js";
import type { ApiResponse } from "../../types/api.types.js";

const videoMetricsService = new VideoMetricsService();

/**
 * Get all video metrics with associated video data
 */
export async function getVideoMetrics(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const videoMetrics = await videoMetricsService.getVideoMetrics();
        const response: ApiResponse<typeof videoMetrics> = {
            success: true,
            message: "Video metrics retrieved successfully",
            data: videoMetrics,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        next(createError(500, err.message));
    }
}

