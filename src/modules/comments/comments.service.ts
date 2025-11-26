import { Types } from "mongoose";
import createError from "http-errors";
import { CommentsRepository } from "./comments.repository.js";
import { VideoModel } from "../../models/video.model.js";
import { NotificationModel } from "../../models/notification.model.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
  PaginatedCommentsParams,
  PaginatedCommentsResponse,
  CommentWithUser,
  CommentWithStats,
  BulkDeleteCommentsInput,
} from "./comments.types.js";
import type { Comment } from "../../models/comment.model.js";

export class CommentsService {
  private repository: CommentsRepository;

  constructor(repository = new CommentsRepository()) {
    this.repository = repository;
  }

  /**
   * Get all comments (admin only)
   */
  async getAllComments(): Promise<CommentWithUser[]> {
    return await this.repository.findAll();
  }

  /**
   * Get comment by ID
   */
  async getCommentById(id: string): Promise<CommentWithUser> {
    const comment = await this.repository.findById(id);
    if (!comment) {
      throw createError(404, "Comment not found");
    }
    return comment;
  }

  /**
   * Get comments by video ID
   */
  async getCommentsByVideoId(videoId: string): Promise<CommentWithUser[]> {
    return await this.repository.findByVideoId(videoId);
  }

  /**
   * Get paginated comments with stats
   */
  async getPaginatedComments(
    params: PaginatedCommentsParams
  ): Promise<PaginatedCommentsResponse> {
    const { page = 1, limit = 10 } = params;
    const { comments, totalItems } = await this.repository.findPaginated(params);

    return {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      comments,
    };
  }

  /**
   * Create a new comment
   */
  async createComment(
    input: CreateCommentInput,
    userId: string
  ): Promise<Comment> {
    if (!input.video_id || !input.content) {
      throw createError(400, "video_id and content are required");
    }

    if (typeof input.content !== "string" || input.content.trim().length === 0) {
      throw createError(400, "Content must be a non-empty string");
    }

    // Verify video exists
    const video = await VideoModel.findById(input.video_id);
    if (!video) {
      throw createError(404, "Video not found");
    }

    const comment = await this.repository.create({
      ...input,
      member_id: userId,
    });

    // Notification Logic
    if (video.created_by && video.created_by.toString() !== userId) {
      await NotificationModel.create({
        recipient_id: video.created_by,
        sender_id: new Types.ObjectId(userId),
        type: "comment",
        reference_id: comment._id,
        reference_type: "Comments",
        message: `commented on your video "${video.title}"`,
      });
    }

    return comment;
  }

  /**
   * Update comment (owner only)
   */
  async updateComment(
    id: string,
    input: UpdateCommentInput,
    userId: string
  ): Promise<Comment> {
    if (!input.content) {
      throw createError(400, "Content is required");
    }

    if (typeof input.content !== "string" || input.content.trim().length === 0) {
      throw createError(400, "Content must be a non-empty string");
    }

    const comment = await this.repository.findByIdForOwnership(id);
    if (!comment) {
      throw createError(404, "Comment not found");
    }

    // Check ownership
    if (comment.member_id.toString() !== userId) {
      throw createError(403, "You can only update your own comments");
    }

    const updatedComment = await this.repository.updateById(id, input);
    if (!updatedComment) {
      throw createError(500, "Failed to update comment");
    }

    return updatedComment;
  }

  /**
   * Delete comment (owner only)
   */
  async deleteComment(id: string, userId: string): Promise<void> {
    const comment = await this.repository.findByIdForOwnership(id);
    if (!comment) {
      throw createError(404, "Comment not found");
    }

    // Check ownership
    if (comment.member_id.toString() !== userId) {
      throw createError(403, "You can only delete your own comments");
    }

    await this.repository.deleteById(id);
  }

  /**
   * Bulk delete comments (admin or owner)
   */
  async bulkDeleteComments(
    input: BulkDeleteCommentsInput,
    userId: string,
    isAdmin: boolean
  ): Promise<{ deletedCount: number }> {
    return await this.repository.bulkDelete(input.ids, userId, isAdmin);
  }
}

