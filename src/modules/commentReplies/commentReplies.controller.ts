import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { CommentRepliesService } from "./commentReplies.service.js";
import type {
    CreateReplyInput,
    UpdateReplyInput,
} from "./commentReplies.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const commentRepliesService = new CommentRepliesService();

/**
 * Get replies by comment ID (public)
 */
export async function getRepliesByCommentId(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const replies = await commentRepliesService.getRepliesByCommentId(req.params.comment_id);
        const response: ApiResponse<typeof replies> = {
            success: true,
            message: "Replies retrieved successfully",
            data: replies,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to fetch replies")
        );
    }
}

/**
 * Create reply (authenticated)
 */
export async function createReply(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        const reply = await commentRepliesService.createReply(
            req.body as CreateReplyInput,
            userId
        );
        const response: ApiResponse<typeof reply> = {
            success: true,
            message: "Reply added successfully",
            data: reply,
        };
        res.status(201).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to create reply")
        );
    }
}

/**
 * Update reply (authenticated - owner only)
 */
export async function updateReply(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        const reply = await commentRepliesService.updateReply(
            req.params.reply_id,
            req.body as UpdateReplyInput,
            userId
        );
        const response: ApiResponse<typeof reply> = {
            success: true,
            message: "Reply updated successfully",
            data: reply,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to update reply")
        );
    }
}

/**
 * Delete reply (authenticated - owner only)
 */
export async function deleteReply(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(401, "Unauthorized"));
        }

        await commentRepliesService.deleteReply(req.params.reply_id, userId);
        const response: ApiResponse = {
            success: true,
            message: "Reply deleted successfully",
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        next(
            err.statusCode
                ? err
                : createError(500, err.message || "Failed to delete reply")
        );
    }
}

