import { CommentReplyModel, type CommentReply } from "../../models/commentReply.model.js";
import type {
    CreateReplyInput,
    UpdateReplyInput,
    CommentReplyWithUser,
} from "./commentReplies.types.js";

export class CommentRepliesRepository {
    /**
     * Find replies by comment ID
     */
    async findByCommentId(commentId: string): Promise<CommentReplyWithUser[]> {
        return (await CommentReplyModel.find({ comment_id: commentId })
            .sort({ createdAt: 1 })
            .populate("member_id", "username first_name last_name profile_pic")
            .exec()) as CommentReplyWithUser[];
    }

    /**
     * Create a new reply
     */
    async create(
        data: CreateReplyInput & { member_id: string }
    ): Promise<CommentReply> {
        return await CommentReplyModel.create({
            comment_id: data.comment_id,
            member_id: data.member_id,
            reply_content: data.reply_content.trim(),
        });
    }

    /**
     * Find reply by ID with populated user
     */
    async findByIdWithUser(id: string): Promise<CommentReplyWithUser | null> {
        return (await CommentReplyModel.findById(id)
            .populate("member_id", "username first_name last_name profile_pic")
            .exec()) as CommentReplyWithUser | null;
    }

    /**
     * Update reply by ID
     */
    async updateById(id: string, data: UpdateReplyInput): Promise<CommentReplyWithUser | null> {
        return (await CommentReplyModel.findByIdAndUpdate(
            id,
            { reply_content: data.reply_content.trim() },
            { new: true, runValidators: true }
        )
            .populate("member_id", "username first_name last_name profile_pic")
            .exec()) as CommentReplyWithUser | null;
    }

    /**
     * Delete reply by ID
     */
    async deleteById(id: string): Promise<CommentReply | null> {
        return await CommentReplyModel.findByIdAndDelete(id).exec();
    }

    /**
     * Find reply by ID (for ownership checks)
     */
    async findByIdForOwnership(id: string): Promise<CommentReply | null> {
        return await CommentReplyModel.findById(id).exec();
    }
}

