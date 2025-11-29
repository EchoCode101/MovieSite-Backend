import type { Comment } from "../../models/comment.model.js";
import type { Types } from "mongoose";

/**
 * Comment with user and target information
 */
export interface CommentWithUser extends Omit<Comment, "member_id" | "target_id"> {
  member_id: {
    _id: Types.ObjectId;
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
  };
  target?: {
    _id: Types.ObjectId;
    title?: string;
    name?: string;
    description?: string;
    thumbnail_url?: string;
  };
}

/**
 * Comment with aggregated statistics
 */
export interface CommentWithStats {
  _id: Types.ObjectId;
  content: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  member: {
    _id: Types.ObjectId;
    first_name?: string;
    last_name?: string;
  };
  target?: {
    _id: Types.ObjectId;
    title?: string;
    name?: string;
    description?: string;
    thumbnail_url?: string;
  };
}

/**
 * Pagination query parameters
 */
export interface PaginatedCommentsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  target_type?: "video" | "movie" | "tvshow" | "episode";
  target_id?: string;
}

/**
 * Paginated comments response
 */
export interface PaginatedCommentsResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  comments: CommentWithStats[];
}

/**
 * Input for creating a comment
 */
export interface CreateCommentInput {
  target_type: "video" | "movie" | "tvshow" | "episode";
  target_id: string;
  content: string;
}

/**
 * Input for updating a comment
 */
export interface UpdateCommentInput {
  content: string;
}

/**
 * Bulk delete input
 */
export interface BulkDeleteCommentsInput {
  ids: string[];
}

