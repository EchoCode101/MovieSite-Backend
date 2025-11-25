import {
  LikesDislikes,
  ReviewsAndRatings,
  Members,
  Videos,
  Comments,
  Notifications,
} from "../../models/index.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";
import mongoose from "mongoose";

// Get reviews with likes/dislikes count
export const getReviewsWithLikesDislikes = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video_id",
          foreignField: "_id",
          as: "video",
        },
      },
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
      {
        $addFields: {
          likes: { $size: "$likes" },
          dislikes: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
          video: { $arrayElemAt: ["$video", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          video_id: 1,
          rating: 1,
          review_content: 1,
          createdAt: 1,
          likes: 1,
          dislikes: 1,
          member: {
            _id: "$member._id",
            first_name: "$member.first_name",
            last_name: "$member.last_name",
            username: "$member.username",
          },
          video: {
            title: "$video.title",
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const reviews = await ReviewsAndRatings.aggregate(pipeline);
    res.status(200).json({
      success: true,
      message: "Reviews with likes/dislikes retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    logger.error("Error fetching reviews with likes/dislikes:", error);
    next(createError(500, error.message));
  }
};

// Add or update like/dislike
export const addOrUpdateLikeDislike = async (req, res, next) => {
  const { target_id, target_type, is_like } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!target_id || !target_type || typeof is_like !== "boolean") {
    return next(
      createError(
        400,
        "target_id, target_type, and is_like (boolean) are required"
      )
    );
  }

  const validTargetTypes = ["video", "comment", "review", "comment_reply"];
  if (!validTargetTypes.includes(target_type)) {
    return next(
      createError(
        400,
        `target_type must be one of: ${validTargetTypes.join(", ")}`
      )
    );
  }

  try {
    // Check for existing interaction to determine if it's a new like or an update
    const existingInteraction = await LikesDislikes.findOne({
      user_id: member_id,
      target_id,
      target_type,
    });

    const likeDislike = await LikesDislikes.findOneAndUpdate(
      {
        user_id: member_id,
        target_id,
        target_type,
      },
      {
        user_id: member_id,
        target_id,
        target_type,
        is_like,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    // Notification Logic
    // Only notify on new likes, not un-likes or toggles to dislike (unless we want to notify on dislike too, usually not)
    // Also check if user is liking their own content
    if (is_like && (!existingInteraction || existingInteraction.is_like === false)) {
      let recipientId = null;
      let message = "";

      if (target_type === "video") {
        const video = await Videos.findById(target_id);
        if (video && video.uploader_id.toString() !== member_id) {
          recipientId = video.uploader_id;
          message = `liked your video "${video.title}"`;
        }
      } else if (target_type === "comment") {
        const comment = await Comments.findById(target_id);
        if (comment && comment.member_id.toString() !== member_id) {
          recipientId = comment.member_id;
          message = `liked your comment: "${comment.content.substring(0, 30)}..."`;
        }
      } else if (target_type === "review") {
        const review = await ReviewsAndRatings.findById(target_id);
        if (review && review.member_id.toString() !== member_id) {
          recipientId = review.member_id;
          message = `liked your review on "${review.video_id}"`; // Ideally fetch video title, but ID is okay for now
        }
      }

      if (recipientId) {
        await Notifications.create({
          recipient_id: recipientId,
          sender_id: member_id,
          type: "like",
          reference_id: target_id,
          reference_type:
            target_type === "video"
              ? "Videos"
              : target_type === "comment"
              ? "Comments"
              : "ReviewsAndRatings",
          message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: is_like ? "Liked successfully" : "Disliked successfully",
      data: likeDislike,
    });
  } catch (error) {
    logger.error("Error adding/updating like/dislike:", error);
    next(createError(500, error.message));
  }
};

// Get likes and dislikes count for a target
export const getLikesDislikesCount = async (req, res, next) => {
  const { target_id, target_type } = req.params;

  try {
    const targetObjectId = mongoose.Types.ObjectId.isValid(target_id)
      ? new mongoose.Types.ObjectId(target_id)
      : target_id;

    const counts = await LikesDislikes.aggregate([
      {
        $match: {
          target_id: targetObjectId,
          target_type: target_type,
        },
      },
      {
        $group: {
          _id: null,
          likes: {
            $sum: { $cond: ["$is_like", 1, 0] },
          },
          dislikes: {
            $sum: { $cond: ["$is_like", 0, 1] },
          },
        },
      },
    ]);

    const result = counts[0] || { likes: 0, dislikes: 0 };
    res.status(200).json({
      success: true,
      message: "Likes/dislikes count retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting likes/dislikes count:", error);
    next(createError(500, error.message));
  }
};
