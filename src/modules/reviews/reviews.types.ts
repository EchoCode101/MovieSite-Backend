import type { Review } from "../../models/review.model.js";
import type { Types } from "mongoose";

/**
 * Review with user and target information
 */
export interface ReviewWithUser extends Omit<Review, "target_id" | "member_id"> {
  target?: {
    _id: Types.ObjectId;
    title?: string;
    name?: string;
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
export interface PaginatedReviewsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  target_type?: "video" | "movie" | "tvshow" | "episode";
  target_id?: string;
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
  target_type: "video" | "movie" | "tvshow" | "episode";
  target_id: string;
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

