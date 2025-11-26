import { Types } from "mongoose";
import createError from "http-errors";
import { ReviewsRepository } from "./reviews.repository.js";
import { VideoModel } from "../../models/video.model.js";
import { NotificationModel } from "../../models/notification.model.js";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  PaginatedReviewsParams,
  RecentReviewsParams,
  PaginatedReviewsResponse,
  ReviewWithUser,
} from "./reviews.types.js";
import type { Review } from "../../models/review.model.js";

export class ReviewsService {
  private repository: ReviewsRepository;

  constructor(repository = new ReviewsRepository()) {
    this.repository = repository;
  }

  /**
   * Get recent reviews within date range
   */
  async getRecentReviews(params: RecentReviewsParams): Promise<ReviewWithUser[]> {
    return await this.repository.findRecent(params);
  }

  /**
   * Get paginated reviews with stats
   */
  async getPaginatedReviews(
    params: PaginatedReviewsParams
  ): Promise<PaginatedReviewsResponse> {
    const { page = 1, limit = 10 } = params;
    const { reviews, totalItems } = await this.repository.findPaginated(params);

    return {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      reviews,
    };
  }

  /**
   * Get reviews by video ID
   */
  async getReviewsByVideoId(videoId: string): Promise<ReviewWithUser[]> {
    return await this.repository.findByVideoId(videoId);
  }

  /**
   * Create a new review (one per user per video)
   */
  async createReview(
    input: CreateReviewInput,
    userId: string
  ): Promise<Review> {
    if (!input.video_id || !input.rating || !input.content) {
      throw createError(400, "video_id, rating, and content are required");
    }

    if (input.rating < 1 || input.rating > 5) {
      throw createError(400, "Rating must be between 1 and 5");
    }

    // Check if video exists
    const video = await VideoModel.findById(input.video_id);
    if (!video) {
      throw createError(404, "Video not found");
    }

    // Check if user already reviewed this video
    const existingReview = await this.repository.findByVideoAndMember(
      input.video_id,
      userId
    );
    if (existingReview) {
      throw createError(409, "You have already reviewed this video");
    }

    const review = await this.repository.create({
      ...input,
      member_id: userId,
    });

    // Notification Logic
    if (video.created_by && video.created_by.toString() !== userId) {
      await NotificationModel.create({
        recipient_id: video.created_by,
        sender_id: new Types.ObjectId(userId),
        type: "review",
        reference_id: review._id,
        reference_type: "ReviewsAndRatings",
        message: `reviewed your video "${video.title}"`,
      });
    }

    return review;
  }

  /**
   * Update review (owner only)
   */
  async updateReview(
    id: string,
    input: UpdateReviewInput,
    userId: string
  ): Promise<Review> {
    if (!input.rating && !input.content) {
      throw createError(400, "At least one field (rating or content) is required");
    }

    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
      throw createError(400, "Rating must be between 1 and 5");
    }

    const review = await this.repository.findByIdForOwnership(id);
    if (!review) {
      throw createError(404, "Review not found");
    }

    if (review.member_id.toString() !== userId) {
      throw createError(403, "You can only update your own reviews");
    }

    const updatedReview = await this.repository.updateById(id, input);
    if (!updatedReview) {
      throw createError(500, "Failed to update review");
    }

    return updatedReview;
  }

  /**
   * Delete review (owner only)
   */
  async deleteReview(id: string, userId: string): Promise<void> {
    const review = await this.repository.findByIdForOwnership(id);
    if (!review) {
      throw createError(404, "Review not found");
    }

    if (review.member_id.toString() !== userId) {
      throw createError(403, "You can only delete your own reviews");
    }

    await this.repository.deleteById(id);
  }
}

