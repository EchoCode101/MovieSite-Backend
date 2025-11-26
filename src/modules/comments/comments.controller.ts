import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { CommentsService } from "./comments.service.js";
import logger from "../../config/logger.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
  PaginatedCommentsParams,
  BulkDeleteCommentsInput,
} from "./comments.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const commentsService = new CommentsService();

/**
 * Create a new comment (authenticated)
 */
export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const comment = await commentsService.createComment(
      req.body as CreateCommentInput,
      userId
    );
    const response: ApiResponse<typeof comment> = {
      success: true,
      message: "Comment created successfully",
      data: comment,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to create comment")
    );
  }
}

/**
 * Get paginated comments (admin)
 */
export async function getPaginatedComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params: PaginatedCommentsParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as "ASC" | "DESC" | undefined,
    };

    const result = await commentsService.getPaginatedComments(params);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching paginated comments:", error);
    next(createError(500, err.message || "Error fetching paginated comments"));
  }
}

/**
 * Get all comments (admin)
 */
export async function getAllComments(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const comments = await commentsService.getAllComments();
    const response: ApiResponse<typeof comments> = {
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching all comments:", error);
    next(createError(500, err.message || "Failed to fetch comments"));
  }
}

/**
 * Get comment by ID (public)
 */
export async function getCommentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const comment = await commentsService.getCommentById(req.params.id);
    const response: ApiResponse<typeof comment> = {
      success: true,
      message: "Comment retrieved successfully",
      data: comment,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error fetching comment by ID:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to fetch comment")
    );
  }
}

/**
 * Update comment (authenticated - owner only)
 */
export async function updateComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const comment = await commentsService.updateComment(
      req.params.id,
      req.body as UpdateCommentInput,
      userId
    );
    const response: ApiResponse<typeof comment> = {
      success: true,
      message: "Comment updated successfully",
      data: comment,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error updating comment:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to update comment")
    );
  }
}

/**
 * Delete comment (authenticated - owner only)
 */
export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    await commentsService.deleteComment(req.params.id, userId);
    const response: ApiResponse = {
      success: true,
      message: "Comment deleted successfully",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error deleting comment:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to delete comment")
    );
  }
}

/**
 * Bulk delete comments (authenticated - admin or owner)
 */
export async function bulkDeleteComments(
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

    const result = await commentsService.bulkDeleteComments(
      req.body as BulkDeleteCommentsInput,
      userId,
      isAdmin
    );
    const response: ApiResponse<typeof result> = {
      success: true,
      message: `${result.deletedCount} comments deleted successfully`,
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error bulk deleting comments:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to delete comments")
    );
  }
}

/**
 * Get comments by video ID (public)
 */
export async function getCommentsByVideoId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const comments = await commentsService.getCommentsByVideoId(req.params.videoId);
    const response: ApiResponse<typeof comments> = {
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching comments by video ID:", error);
    next(createError(500, err.message || "Failed to fetch comments"));
  }
}

