import { Types } from "mongoose";
import createError from "http-errors";
import { LikesDislikesRepository } from "./likesDislikes.repository.js";
import { VideoModel } from "../../models/video.model.js";
import { CommentModel } from "../../models/comment.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { NotificationModel } from "../../models/notification.model.js";
import type {
  LikeDislikeInput,
  LikesDislikesCount,
  UserReaction,
  ToggleResult,
  TargetType,
} from "./likesDislikes.types.js";
import type { LikeDislike } from "../../models/likeDislike.model.js";

export class LikesDislikesService {
  private repository: LikesDislikesRepository;

  constructor(repository = new LikesDislikesRepository()) {
    this.repository = repository;
  }

  /**
   * Add or update like/dislike (three-state toggle: neutral → like → dislike → remove)
   */
  async toggleLikeDislike(
    input: LikeDislikeInput,
    userId: string
  ): Promise<ToggleResult> {
    if (!input.target_id || !input.target_type || typeof input.is_like !== "boolean") {
      throw createError(
        400,
        "target_id, target_type, and is_like (boolean) are required"
      );
    }

    const validTargetTypes: TargetType[] = ["video", "movie", "tvshow", "episode", "comment", "review", "comment_reply"];
    if (!validTargetTypes.includes(input.target_type)) {
      throw createError(
        400,
        `target_type must be one of: ${validTargetTypes.join(", ")}`
      );
    }

    // Check for existing interaction
    const existingInteraction = await this.repository.findExisting(
      userId,
      input.target_id,
      input.target_type
    );

    // If the user is sending the same reaction again, interpret as clearing (neutral state)
    if (existingInteraction && existingInteraction.is_like === input.is_like) {
      await this.repository.delete(userId, input.target_id, input.target_type);
      return { removed: true };
    }

    // Otherwise create a new reaction or toggle between like and dislike
    const likeDislike = await this.repository.upsert(
      userId,
      input.target_id,
      input.target_type,
      input.is_like
    );

    // Notification Logic
    // Only notify on new likes or when switching from dislike -> like.
    // Do not notify on dislikes or when removing a reaction.
    if (input.is_like && (!existingInteraction || existingInteraction.is_like === false)) {
      await this.sendLikeNotification(input.target_id, input.target_type, userId);
    }

    return { likeDislike };
  }

  /**
   * Send like notification (private helper)
   */
  private async sendLikeNotification(
    targetId: string,
    targetType: TargetType,
    senderId: string
  ): Promise<void> {
    let recipientId: Types.ObjectId | null = null;
    let message = "";
    let referenceType = "";

    if (targetType === "video") {
      const video = await VideoModel.findById(targetId);
      if (video && video.created_by && video.created_by.toString() !== senderId) {
        recipientId = video.created_by;
        message = `liked your video "${video.title}"`;
        referenceType = "Videos";
      }
    } else if (targetType === "comment") {
      const comment = await CommentModel.findById(targetId);
      if (comment && comment.member_id.toString() !== senderId) {
        recipientId = comment.member_id;
        message = `liked your comment: "${comment.content.substring(0, 30)}..."`;
        referenceType = "Comments";
      }
    } else if (targetType === "review") {
      const review = await ReviewModel.findById(targetId);
      if (review && review.member_id.toString() !== senderId) {
        recipientId = review.member_id;
        message = `liked your review`;
        referenceType = "ReviewsAndRatings";
      }
    }

    if (recipientId) {
      await NotificationModel.create({
        recipient_id: recipientId,
        sender_id: new Types.ObjectId(senderId),
        type: "like",
        reference_id: new Types.ObjectId(targetId),
        reference_type: referenceType,
        message,
      });
    }
  }

  /**
   * Get likes/dislikes count for a target
   */
  async getCount(
    targetId: string,
    targetType: TargetType
  ): Promise<LikesDislikesCount> {
    return await this.repository.getCount(targetId, targetType);
  }

  /**
   * Get user's reaction for a specific target
   */
  async getUserReaction(
    userId: string,
    targetId: string,
    targetType: TargetType
  ): Promise<UserReaction> {
    return await this.repository.getUserReaction(userId, targetId, targetType);
  }

  /**
   * Get all reviews with their likes/dislikes counts
   */
  async getReviewsWithLikesDislikes(): Promise<any[]> {
    return await this.repository.getReviewsWithLikesDislikes();
  }
}

