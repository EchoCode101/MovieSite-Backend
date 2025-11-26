import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { LikesDislikesService } from "./likesDislikes.service.js";
import logger from "../../config/logger.js";
import type {
  LikeDislikeInput,
  TargetType,
} from "./likesDislikes.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const likesDislikesService = new LikesDislikesService();

/**
 * Add or update like/dislike (authenticated)
 */
export async function addOrUpdateLikeDislike(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const result = await likesDislikesService.toggleLikeDislike(
      req.body as LikeDislikeInput,
      userId
    );

    if (result.removed) {
      const response: ApiResponse<typeof result> = {
        success: true,
        message: "Reaction removed",
        data: result,
      };
      res.status(200).json(response);
    } else {
      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.likeDislike?.is_like ? "Liked successfully" : "Disliked successfully",
        data: result,
      };
      res.status(201).json(response);
    }
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error adding/updating like/dislike:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to toggle like/dislike")
    );
  }
}

/**
 * Get likes/dislikes count for a target (public)
 */
export async function getLikesDislikesCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { target_id, target_type } = req.params;
    const count = await likesDislikesService.getCount(
      target_id,
      target_type as TargetType
    );
    const response: ApiResponse<typeof count> = {
      success: true,
      message: "Likes/dislikes count retrieved successfully",
      data: count,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error getting likes/dislikes count:", error);
    next(createError(500, err.message || "Failed to get count"));
  }
}

/**
 * Get user's reaction for a specific target (authenticated)
 */
export async function getUserReaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const { target_id, target_type } = req.params;
    const reaction = await likesDislikesService.getUserReaction(
      userId,
      target_id,
      target_type as TargetType
    );
    const response: ApiResponse<typeof reaction> = {
      success: true,
      message: "User reaction retrieved successfully",
      data: reaction,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error getting user reaction:", error);
    next(createError(500, err.message || "Failed to get user reaction"));
  }
}

/**
 * Get all reviews with likes/dislikes counts (public)
 */
export async function getReviewsWithLikesDislikes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reviews = await likesDislikesService.getReviewsWithLikesDislikes();
    const response: ApiResponse<typeof reviews> = {
      success: true,
      message: "Reviews with likes/dislikes retrieved successfully",
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error getting reviews with likes/dislikes:", error);
    next(createError(500, err.message || "Failed to get reviews with likes/dislikes"));
  }
}

