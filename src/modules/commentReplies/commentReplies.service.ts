import { Types } from "mongoose";
import createError from "http-errors";
import { CommentRepliesRepository } from "./commentReplies.repository.js";
import { CommentModel } from "../../models/comment.model.js";
import { NotificationModel } from "../../models/notification.model.js";
import type {
    CreateReplyInput,
    UpdateReplyInput,
    CommentReplyWithUser,
} from "./commentReplies.types.js";
import type { CommentReply } from "../../models/commentReply.model.js";

export class CommentRepliesService {
    private repository: CommentRepliesRepository;

    constructor(repository = new CommentRepliesRepository()) {
        this.repository = repository;
    }

    /**
     * Get replies by comment ID
     */
    async getRepliesByCommentId(commentId: string): Promise<CommentReplyWithUser[]> {
        return await this.repository.findByCommentId(commentId);
    }

    /**
     * Create a new reply
     */
    async createReply(
        input: CreateReplyInput,
        userId: string
    ): Promise<CommentReplyWithUser> {
        if (!input.comment_id || !input.reply_content) {
            throw createError(400, "comment_id and reply_content are required");
        }

        if (typeof input.reply_content !== "string" || input.reply_content.trim().length === 0) {
            throw createError(400, "reply_content must be a non-empty string");
        }

        // Verify comment exists
        const comment = await CommentModel.findById(input.comment_id);
        if (!comment) {
            throw createError(404, "Comment not found");
        }

        const reply = await this.repository.create({
            ...input,
            member_id: userId,
        });

        // Notification Logic
        if (comment.member_id.toString() !== userId) {
            await NotificationModel.create({
                recipient_id: comment.member_id,
                sender_id: new Types.ObjectId(userId),
                type: "reply",
                reference_id: reply._id,
                reference_type: "Comments",
                message: `replied to your comment: "${comment.content.substring(0, 30)}..."`,
            });
        }

        // Populate member_id before returning
        const populatedReply = await this.repository.findByIdWithUser((reply._id as any).toString());
        if (!populatedReply) {
            throw createError(500, "Failed to retrieve created reply");
        }

        return populatedReply;
    }

    /**
     * Update reply (owner only)
     */
    async updateReply(
        id: string,
        input: UpdateReplyInput,
        userId: string
    ): Promise<CommentReplyWithUser> {
        if (!input.reply_content) {
            throw createError(400, "reply_content is required");
        }

        if (typeof input.reply_content !== "string" || input.reply_content.trim().length === 0) {
            throw createError(400, "reply_content must be a non-empty string");
        }

        const reply = await this.repository.findByIdForOwnership(id);
        if (!reply) {
            throw createError(404, "Reply not found");
        }

        // Check ownership
        if (reply.member_id.toString() !== userId) {
            throw createError(403, "You can only update your own replies");
        }

        const updatedReply = await this.repository.updateById(id, input);
        if (!updatedReply) {
            throw createError(500, "Failed to update reply");
        }

        return updatedReply;
    }

    /**
     * Delete reply (owner only)
     */
    async deleteReply(id: string, userId: string): Promise<void> {
        const reply = await this.repository.findByIdForOwnership(id);
        if (!reply) {
            throw createError(404, "Reply not found");
        }

        // Check ownership
        if (reply.member_id.toString() !== userId) {
            throw createError(403, "You can only delete your own replies");
        }

        await this.repository.deleteById(id);
    }
}

