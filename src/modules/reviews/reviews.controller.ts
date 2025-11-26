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
    };

    const result = await reviewsService.getPaginatedReviews(params);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching paginated reviews:", error);
    next(createError(500, err.message));
  }
}

/**
 * Get reviews by video ID (public)
 */
export async function getReviewsByVideoId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reviews = await reviewsService.getReviewsByVideoId(req.params.videoId);
    const response: ApiResponse<typeof reviews> = {
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching reviews by video ID:", error);
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
 * Delete review (authenticated - owner only)
 */
export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    await reviewsService.deleteReview(req.params.reviewId, userId);
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

