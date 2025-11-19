import { ReviewsAndRatings, Videos, Members } from "../../models/index.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";

// Get reviews within a date range
export const getRecentReviews = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const reviews = await ReviewsAndRatings.find(query)
      .sort({ createdAt: -1 })
      .populate("video_id", "title")
      .populate("member_id", "username first_name last_name");

    res.status(200).json({
      success: true,
      message: "Recent reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    logger.error("Error fetching recent reviews:", error);
    next(createError(500, error.message));
  }
};

// Get paginated reviews
export const getPaginatedReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline
    const pipeline = [
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
      // Populate member
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      // Populate video
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
      // Project fields
      {
        $project: {
          _id: 1,
          review_content: 1,
          rating: 1,
          createdAt: 1,
          likesCount: 1,
          dislikesCount: 1,
          member: {
            _id: "$member._id",
            first_name: "$member.first_name",
            last_name: "$member.last_name",
          },
          video: {
            _id: "$video._id",
            title: "$video.title",
            description: "$video.description",
            thumbnail_url: "$video.thumbnail_url",
          },
        },
      },
    ];

    // Add sorting
    let sortField = sort;
    if (sort === "likes") {
      sortField = "likesCount";
    } else if (sort === "dislikes") {
      sortField = "dislikesCount";
    }

    pipeline.push({ $sort: { [sortField]: sortOrder } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Get total count
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove skip and limit
      { $count: "total" },
    ];
    const countResult = await ReviewsAndRatings.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Get reviews
    const reviews = await ReviewsAndRatings.aggregate(pipeline);

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / parseInt(limit)),
      totalItems,
      reviews,
    });
  } catch (error) {
    logger.error("Error fetching paginated reviews:", error);
    next(createError(500, error.message));
  }
};

// Add a new review
export const addReview = async (req, res, next) => {
  const { video_id, rating, content } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!video_id || !rating || !content) {
    return next(createError(400, "video_id, rating, and content are required"));
  }

  if (rating < 1 || rating > 5) {
    return next(createError(400, "Rating must be between 1 and 5"));
  }

  try {
    // Check if video exists
    const video = await Videos.findById(video_id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }

    // Check if user already reviewed this video
    const existingReview = await ReviewsAndRatings.findOne({
      video_id,
      member_id,
    });
    if (existingReview) {
      return next(createError(409, "You have already reviewed this video"));
    }

    // Insert review
    const review = await ReviewsAndRatings.create({
      video_id,
      member_id,
      rating,
      review_content: content,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    logger.error("Error adding review:", error);
    next(createError(500, error.message));
  }
};

// Get all reviews for a video, including related data
export const getReviewsByVideoId = async (req, res, next) => {
  const { videoId } = req.params;

  try {
    const reviews = await ReviewsAndRatings.find({ video_id: videoId })
      .sort({ createdAt: -1 })
      .populate("video_id", "title category")
      .populate("member_id", "username email first_name last_name");

    res.status(200).json(reviews);
  } catch (error) {
    logger.error("Error fetching reviews by video ID:", error);
    next(createError(500, error.message));
  }
};

// Update a review
export const updateReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, content } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!rating && !content) {
    return next(
      createError(400, "At least one field (rating or content) is required")
    );
  }

  if (rating && (rating < 1 || rating > 5)) {
    return next(createError(400, "Rating must be between 1 and 5"));
  }

  try {
    // Check if review exists and belongs to user
    const review = await ReviewsAndRatings.findById(reviewId);
    if (!review) {
      return next(createError(404, "Review not found"));
    }

    if (review.member_id.toString() !== member_id) {
      return next(createError(403, "You can only update your own reviews"));
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (content !== undefined) updateData.review_content = content;

    const updatedReview = await ReviewsAndRatings.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    logger.error("Error updating review:", error);
    next(createError(500, error.message));
  }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const member_id = req.user.id; // Extract from authenticated token

  try {
    const review = await ReviewsAndRatings.findById(reviewId);

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    // Check ownership
    if (review.member_id.toString() !== member_id) {
      return next(createError(403, "You can only delete your own reviews"));
    }

    await ReviewsAndRatings.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting review:", error);
    next(createError(500, error.message));
  }
};
