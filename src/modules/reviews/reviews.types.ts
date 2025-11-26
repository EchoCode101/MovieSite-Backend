import type { Review } from "../../models/review.model.js";
import type { Types } from "mongoose";

/**
 * Review with user and video information
 */
export interface ReviewWithUser extends Omit<Review, "video_id" | "member_id"> {
  video_id: {
    _id: Types.ObjectId;
    title: string;
    category?: string;
  };
  member_id: {
    _id: Types.ObjectId;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Review with aggregated statistics
 */
export interface ReviewWithStats {
  _id: Types.ObjectId;
  review_content?: string;
  rating: number;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  member: {
    _id: Types.ObjectId;
    first_name?: string;
    last_name?: string;
  };
  video: {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    thumbnail_url?: string;
  };
}

/**
 * Pagination query parameters
 */
export interface PaginatedReviewsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

/**
 * Paginated reviews response
 */
export interface PaginatedReviewsResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  reviews: ReviewWithStats[];
}

/**
 * Recent reviews query parameters
 */
export interface RecentReviewsParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Input for creating a review
 */
export interface CreateReviewInput {
  video_id: string;
  rating: number;
  content: string;
}

/**
 * Input for updating a review
 */
export interface UpdateReviewInput {
  rating?: number;
  content?: string;
}

