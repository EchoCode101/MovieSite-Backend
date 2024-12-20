import { Reviews, Videos, Members } from "../../models/index.js";
import logger from "../Utilities/logger.js";

import { Op } from "sequelize";
// Get reviews within a date range
export const getRecentReviews = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const reviews = await Reviews.findAll({
      where: {
        created_at: {
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
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(reviews);
  } catch (error) {
    logger.error("Error fetching recent reviews:", error);
    next(createError(500, error.message));
  }
};

// Add a new review
export const addReview = async (req, res, next) => {
  const { video_id, member_id, rating, content } = req.body;

  try {
    // Insert review
    const review = await Reviews.create({
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
    const reviews = await Reviews.findAll({
      where: { video_id: videoId },
      order: [["created_at", "DESC"]],
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
    const review = await Reviews.findByPk(reviewId);

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
    const review = await Reviews.findByPk(reviewId);

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
