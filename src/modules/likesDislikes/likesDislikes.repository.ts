import { Types } from "mongoose";
import { LikeDislikeModel, type LikeDislike } from "../../models/likeDislike.model.js";
import { ReviewModel } from "../../models/review.model.js";
import type {
  TargetType,
  LikesDislikesCount,
  UserReaction,
} from "./likesDislikes.types.js";

export class LikesDislikesRepository {
  /**
   * Find existing interaction
   */
  async findExisting(
    userId: string,
    targetId: string,
    targetType: TargetType
  ): Promise<LikeDislike | null> {
    return await LikeDislikeModel.findOne({
      user_id: userId,
      target_id: targetId,
      target_type: targetType,
    }).exec();
  }

  /**
   * Create or update like/dislike (upsert)
   */
  async upsert(
    userId: string,
    targetId: string,
    targetType: TargetType,
    isLike: boolean
  ): Promise<LikeDislike> {
    return await LikeDislikeModel.findOneAndUpdate(
      {
        user_id: userId,
        target_id: targetId,
        target_type: targetType,
      },
      {
        user_id: userId,
        target_id: targetId,
        target_type: targetType,
        is_like: isLike,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).exec();
  }

  /**
   * Delete like/dislike
   */
  async delete(
    userId: string,
    targetId: string,
    targetType: TargetType
  ): Promise<void> {
    await LikeDislikeModel.deleteOne({
      user_id: userId,
      target_id: targetId,
      target_type: targetType,
    }).exec();
  }

  /**
   * Get likes/dislikes count for a target
   */
  async getCount(
    targetId: string,
    targetType: TargetType
  ): Promise<LikesDislikesCount> {
    const targetObjectId = Types.ObjectId.isValid(targetId)
      ? new Types.ObjectId(targetId)
      : targetId;

    const counts = await LikeDislikeModel.aggregate([
      {
        $match: {
          target_id: targetObjectId,
          target_type: targetType,
        },
      },
      {
        $group: {
          _id: null,
          likes: {
            $sum: { $cond: [{ $eq: ["$is_like", true] }, 1, 0] },
          },
          dislikes: {
            $sum: { $cond: [{ $eq: ["$is_like", false] }, 1, 0] },
          },
        },
      },
    ]);

    return counts[0] || { likes: 0, dislikes: 0 };
  }

  /**
   * Get user's reaction for a specific target
   */
  async getUserReaction(
    userId: string,
    targetId: string,
    targetType: TargetType
  ): Promise<UserReaction> {
    const targetObjectId = Types.ObjectId.isValid(targetId)
      ? new Types.ObjectId(targetId)
      : targetId;

    const reaction = await LikeDislikeModel.findOne({
      user_id: new Types.ObjectId(userId),
      target_id: targetObjectId,
      target_type: targetType,
    }).exec();

    return {
      hasReacted: !!reaction,
      isLike: reaction ? reaction.is_like : null,
    };
  }

  /**
   * Get all reviews with their likes/dislikes counts
   */
  async getReviewsWithLikesDislikes(): Promise<any[]> {
    const reviews = await ReviewModel.aggregate([
      // Lookup likes
      {
        $lookup: {
          from: "likesdislikes",
          let: { reviewId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$reviewId"] },
                    { $eq: ["$target_type", "review"] },
                    { $eq: ["$is_like", true] },
                  ],
                },
              },
            },
          ],
          as: "likes",
        },
      },
      // Lookup dislikes
      {
        $lookup: {
          from: "likesdislikes",
          let: { reviewId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$reviewId"] },
                    { $eq: ["$target_type", "review"] },
                    { $eq: ["$is_like", false] },
                  ],
                },
              },
            },
          ],
          as: "dislikes",
        },
      },
      // Lookup member
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      // Lookup video
      {
        $lookup: {
          from: "videos",
          localField: "video_id",
          foreignField: "_id",
          as: "video",
        },
      },
      // Add computed fields
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
          video: { $arrayElemAt: ["$video", 0] },
        },
      },
      // Project final fields
      {
        $project: {
          _id: 1,
          member_id: 1,
          video_id: 1,
          rating: 1,
          review_content: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          dislikesCount: 1,
          member: {
            _id: "$member._id",
            username: "$member.username",
            email: "$member.email",
            profile_pic: "$member.profile_pic",
            first_name: "$member.first_name",
            last_name: "$member.last_name",
          },
          video: {
            _id: "$video._id",
            title: "$video.title",
            video_url: "$video.video_url",
          },
        },
      },
      // Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 },
      },
    ]).exec();

    return reviews;
  }
}

