import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { ReviewsService } from "./reviews.service.js";
import logger from "../../config/logger.js";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  PaginatedReviewsParams,
  RecentReviewsParams,
} from "./reviews.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const reviewsService = new ReviewsService();

/**
 * Get recent reviews (public)
 */
export async function getRecentReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params: RecentReviewsParams = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const reviews = await reviewsService.getRecentReviews(params);
    const response: ApiResponse<typeof reviews> = {
      success: true,
      message: "Recent reviews retrieved successfully",
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching recent reviews:", error);
    next(createError(500, err.message));
  }
}

/**
 * Get paginated reviews (public)
 */
export async function getPaginatedReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params: PaginatedReviewsParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as "ASC" | "DESC" | undefined,
      target_type: req.query.target_type as "video" | "movie" | "tvshow" | "episode" | undefined,
      target_id: req.query.target_id as string | undefined,
    };

    const result = await reviewsService.getPaginatedReviews(params);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching paginated reviews:", error);
    next(createError(500, err.message));
  }
}

/**
 * Get reviews by video ID (public) - legacy endpoint
 */
export async function getReviewsByVideo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const videoId = req.params.videoId;
    
    if (!videoId) {
      return next(createError(400, "Video ID is required"));
    }

    const reviews = await reviewsService.getReviewsByTarget("video", videoId);
    const response: ApiResponse<typeof reviews> = {
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching reviews by video:", error);
    next(createError(500, err.message || "Failed to fetch reviews"));
  }
}

/**
 * Get reviews by target type and ID (public)
 */
export async function getReviewsByTarget(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const targetType = req.params.targetType as "video" | "movie" | "tvshow" | "episode";
    const targetId = req.params.targetId;
    
    if (!["video", "movie", "tvshow", "episode"].includes(targetType)) {
      return next(createError(400, "Invalid target type. Must be one of: video, movie, tvshow, episode"));
    }

    const reviews = await reviewsService.getReviewsByTarget(targetType, targetId);
    const response: ApiResponse<typeof reviews> = {
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching reviews by target:", error);
    next(createError(500, err.message));
  }
}

/**
 * Create review (authenticated - one per user per video)
 */
export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const review = await reviewsService.createReview(
      req.body as CreateReviewInput,
      userId
    );
    const response: ApiResponse<typeof review> = {
      success: true,
      message: "Review added successfully",
      data: review,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error adding review:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to create review")
    );
  }
}

/**
 * Update review (authenticated - owner only)
 */
export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const review = await reviewsService.updateReview(
      req.params.reviewId,
      req.body as UpdateReviewInput,
      userId
    );
    const response: ApiResponse<typeof review> = {
      success: true,
      message: "Review updated successfully",
      data: review,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error updating review:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to update review")
    );
  }
}

/**
 * Delete review (authenticated - owner or admin)
 */
export async function deleteReview(
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

    await reviewsService.deleteReview(req.params.reviewId, userId, isAdmin);
    const response: ApiResponse = {
      success: true,
      message: "Review deleted successfully",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error deleting review:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to delete review")
    );
  }
}

/**
 * Get user's own reviews (authenticated)
 */
export async function getMyReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const params: PaginatedReviewsParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as "ASC" | "DESC" | undefined,
      target_type: req.query.target_type as "video" | "movie" | "tvshow" | "episode" | undefined,
      target_id: req.query.target_id as string | undefined,
    };

    const result = await reviewsService.getMyReviews(userId, params);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching user reviews:", error);
    next(createError(500, err.message || "Error fetching user reviews"));
  }
}

/**
 * Bulk delete reviews (authenticated - admin or owner)
 */
export async function bulkDeleteReviews(
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

    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(createError(400, "ids array is required and must not be empty"));
    }

    const result = await reviewsService.bulkDeleteReviews(ids, userId, isAdmin);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: `${result.deletedCount} reviews deleted successfully`,
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error bulk deleting reviews:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to delete reviews")
    );
  }
}

