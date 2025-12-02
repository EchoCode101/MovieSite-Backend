import { Types } from "mongoose";
import createError from "http-errors";
import { CommentsRepository } from "./comments.repository.js";
import { VideoModel } from "../../models/video.model.js";
import { MovieModel } from "../../models/movie.model.js";
import { TvShowModel } from "../../models/tvShow.model.js";
import { EpisodeModel } from "../../models/episode.model.js";
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
   * Get comments by target type and ID
   */
  async getCommentsByTarget(
    targetType: "video" | "movie" | "tvshow" | "episode",
    targetId: string
  ): Promise<CommentWithUser[]> {
    return await this.repository.findByTarget(targetType, targetId);
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
  ): Promise<CommentWithUser> {
    if (!input.target_type || !input.target_id || !input.content) {
      throw createError(400, "target_type, target_id, and content are required");
    }

    if (typeof input.content !== "string" || input.content.trim().length === 0) {
      throw createError(400, "Content must be a non-empty string");
    }

    // Verify target exists based on type
    let target: any = null;
    let targetTitle = "";

    if (input.target_type === "video") {
      target = await VideoModel.findById(input.target_id);
      if (!target) {
        throw createError(404, "Video not found");
      }
      targetTitle = target.title;
    } else if (input.target_type === "movie") {
      target = await MovieModel.findById(input.target_id);
      if (!target) {
        throw createError(404, "Movie not found");
      }
      targetTitle = target.title;
    } else if (input.target_type === "tvshow") {
      target = await TvShowModel.findById(input.target_id);
      if (!target) {
        throw createError(404, "TV Show not found");
      }
      targetTitle = target.title;
    } else if (input.target_type === "episode") {
      target = await EpisodeModel.findById(input.target_id);
      if (!target) {
        throw createError(404, "Episode not found");
      }
      targetTitle = target.title;
    }

    const comment = await this.repository.create({
      ...input,
      member_id: userId,
    });

    // Notification Logic - notify content creator
    const createdBy = (target as any)?.created_by;
    if (createdBy && createdBy.toString() !== userId) {
      await NotificationModel.create({
        recipient_id: createdBy,
        sender_id: new Types.ObjectId(userId),
        type: "comment",
        reference_id: comment._id,
        reference_type: "Comments",
        message: `commented on your ${input.target_type} "${targetTitle}"`,
      });
    }

    // Populate member_id before returning
    const commentId = (comment._id as Types.ObjectId).toString();
    const populatedComment = await this.repository.findById(commentId);
    if (!populatedComment) {
      throw createError(500, "Failed to retrieve created comment");
    }

    return populatedComment;
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
   * Delete comment (owner or admin)
   */
  async deleteComment(id: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.repository.findByIdForOwnership(id);
    if (!comment) {
      throw createError(404, "Comment not found");
    }

    // Check ownership or admin role
    if (!isAdmin && comment.member_id.toString() !== userId) {
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

  /**
   * Get user's own comments with pagination
   */
  async getMyComments(
    userId: string,
    params: PaginatedCommentsParams
  ): Promise<PaginatedCommentsResponse> {
    const { page = 1, limit = 10 } = params;
    const { comments, totalItems } = await this.repository.findUserComments(
      userId,
      params
    );

    return {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      comments,
    };
  }
}

