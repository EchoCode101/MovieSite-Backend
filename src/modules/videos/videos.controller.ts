import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { VideosService } from "./videos.service.js";
import type {
    CreateVideoInput,
    UpdateVideoInput,
    BulkDeleteVideosInput,
    PaginatedVideosParams,
} from "./videos.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const videosService = new VideosService();

/**
 * Get all videos (admin only)
 */
export async function getAllVideos(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const videos = await videosService.getAllVideos();
        const response: ApiResponse<typeof videos> = {
            success: true,
            message: "Videos retrieved successfully",
            data: videos,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        next(createError(500, err.message));
    }
}

/**
 * Get video by ID (public)
 */
export async function getVideoById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const video = await videosService.getVideoById(req.params.id);
        const response: ApiResponse<typeof video> = {
            success: true,
            message: "Video retrieved successfully",
            data: video,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Error fetching video")
        );
    }
}

/**
 * Get paginated videos (public)
 */
export async function getPaginatedVideos(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const params: PaginatedVideosParams = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            sort: req.query.sort as string | undefined,
            order: req.query.order as "ASC" | "DESC" | undefined,
        };

        const result = await videosService.getPaginatedVideos(params);
        res.status(200).json(result);
    } catch (error: unknown) {
        const err = error as Error;
        next(createError(500, err.message || "Error fetching videos"));
    }
}

/**
 * Get videos with likes/dislikes (admin only)
 */
export async function getVideosWithLikesDislikes(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const videos = await videosService.getVideosWithLikesDislikes();
        const response: ApiResponse<typeof videos> = {
            success: true,
            message: "Videos with likes/dislikes retrieved successfully",
            data: videos,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        next(createError(500, err.message));
    }
}

/**
 * Create a new video (admin only)
 */
export async function createVideo(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        const video = await videosService.createVideo(
            req.body as CreateVideoInput,
            userId
        );
        const response: ApiResponse<typeof video> = {
            success: true,
            message: "Video created successfully.",
            data: video,
        };
        res.status(201).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to create video.")
        );
    }
}

/**
 * Upload video to Cloudinary (authenticated)
 */
export async function uploadVideoToCloudinary(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.file) {
            return next(createError(400, "No video file uploaded."));
        }

        const result = await videosService.uploadVideoToCloudinary(req.file);
        const response: ApiResponse<typeof result> = {
            success: true,
            message: "Video uploaded successfully.",
            data: result,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        next(createError(500, err.message || "Failed to upload video."));
    }
}

/**
 * Update video (admin only)
 */
export async function updateVideo(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const video = await videosService.updateVideo(
            req.params.id,
            req.body as UpdateVideoInput
        );
        const response: ApiResponse<typeof video> = {
            success: true,
            message: "Video updated successfully",
            data: video,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number; code?: number };
        if (err.code === 11000) {
            next(createError(400, "Title or Video URL already exists"));
        } else {
            next(
                err.statusCode
                    ? err
                    : createError(500, err.message || "Failed to update video")
            );
        }
    }
}

/**
 * Delete video (admin only)
 */
export async function deleteVideo(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await videosService.deleteVideo(req.params.id);
        res.status(200).json({ message: "Video deleted successfully" });
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to delete video")
        );
    }
}

/**
 * Bulk delete videos (authenticated - admin or owner)
 */
export async function bulkDeleteVideos(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === "admin";

        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        const input = req.body as BulkDeleteVideosInput;
        const result = await videosService.bulkDeleteVideos(input, userId, isAdmin);

        const response: ApiResponse<typeof result> = {
            success: true,
            message: `${result.deletedCount} videos deleted successfully`,
            data: result,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to delete videos")
        );
    }
}

/**
 * Add video to database (authenticated)
 */
export async function addVideoToDatabase(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        const video = await videosService.addVideoToDatabase(
            req.body as CreateVideoInput,
            userId
        );
        const response: ApiResponse<typeof video> = {
            success: true,
            message: "Video added to the database successfully.",
            data: video,
        };
        res.status(201).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to add video to the database.")
        );
    }
}

