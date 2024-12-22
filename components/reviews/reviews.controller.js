import { ReviewsAndRatings, Videos, Members } from "../../models/index.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
// Get reviews within a date range
export const getRecentReviews = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const reviews = await ReviewsAndRatings.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Videos,
          as: "video", // Correct alias as defined in the association
          attributes: ["title"],
        },
        {
          model: Members,
          as: "member", // Correct alias as defined in the association
          attributes: ["username", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(reviews);
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

    const offset = (page - 1) * limit;

    let orderQuery = [[sort, order]];

    // Special sorting cases for likes and dislikes
    if (sort === "likes" || sort === "dislikes") {
      orderQuery = [
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM "LikesDislikes" WHERE "LikesDislikes"."target_type" = 'review' AND "LikesDislikes"."target_id" = "ReviewsAndRatings"."review_id" AND "LikesDislikes"."is_like" = ${
              sort === "likes" ? "true" : "false"
            })`
          ),
          order,
        ],
      ];
    }

    // Get total reviews count
    const count = await ReviewsAndRatings.count();

    // Fetch paginated reviews with associations
    const reviews = await ReviewsAndRatings.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderQuery,
      attributes: [
        "review_id",
        "review_content",
        "rating",
        "createdAt",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM "LikesDislikes"
            WHERE "LikesDislikes"."target_id" = "ReviewsAndRatings"."review_id"
            AND "LikesDislikes"."target_type" = 'review'
            AND "LikesDislikes"."is_like" = true
          )`),
          "likesCount",
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM "LikesDislikes"
            WHERE "LikesDislikes"."target_id" = "ReviewsAndRatings"."review_id"
            AND "LikesDislikes"."target_type" = 'review'
            AND "LikesDislikes"."is_like" = false
          )`),
          "dislikesCount",
        ],
      ],
      include: [
        {
          model: Members,
          as: "member",
          attributes: ["member_id", "first_name", "last_name"],
        },
        {
          model: Videos,
          as: "video",
          attributes: ["video_id", "title", "description", "thumbnail_url"],
        },
      ],
    });

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      reviews,
    });
  } catch (error) {
    logger.error("Error fetching paginated reviews:", error);
    next(createError(500, error.message));
  }
};

// Add a new review
export const addReview = async (req, res, next) => {
  const { video_id, member_id, rating, content } = req.body;

  try {
    // Insert review
    const review = await ReviewsAndRatings.create({
      video_id,
      member_id,
      rating,
      content,
    });

    // Update video's rating and total_ratings
    const video = await Videos.findByPk(video_id);
    const updatedRating =
      (video.rating * video.total_ratings + rating) / (video.total_ratings + 1);

    await video.update({
      rating: updatedRating,
      total_ratings: video.total_ratings + 1,
      review_counts: video.review_counts + 1,
    });

    res.status(201).json(review);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get all reviews for a video, including related data
export const getReviewsByVideoId = async (req, res, next) => {
  const { videoId } = req.params;

  try {
    const reviews = await ReviewsAndRatings.findAll({
      where: { video_id: videoId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Videos,
          attributes: ["title", "category", "rating"],
        },
        {
          model: Members,
          attributes: ["username", "email", "first_name", "last_name"],
        },
      ],
    });

    res.status(200).json(reviews);
  } catch (error) {
    next(createError(500, error.message));
  }
};
// Update a review
export const updateReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, content } = req.body;

  try {
    const review = await ReviewsAndRatings.findByPk(reviewId);

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    const video = await Videos.findByPk(review.video_id);

    const updatedReview = await review.update({
      rating,
      content,
    });

    const updatedRating =
      (video.rating * video.total_ratings - review.rating + rating) /
      video.total_ratings;

    await video.update({ rating: updatedRating });

    res.status(200).json(updatedReview);
  } catch (error) {
    next(createError(500, error.message));
  }
};
// Delete a review
export const deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    const review = await ReviewsAndRatings.findByPk(reviewId);

    if (!review) {
      next(createError(404, "Review not found"));
    }

    const video = await Videos.findByPk(review.video_id);

    await review.destroy();

    const updatedRating =
      video.total_ratings > 1
        ? (video.rating * video.total_ratings - review.rating) /
          (video.total_ratings - 1)
        : 0;

    await video.update({
      rating: updatedRating,
      total_ratings: video.total_ratings - 1,
      review_counts: video.review_counts - 1,
    });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(createError(500, error.message));
  }
};
