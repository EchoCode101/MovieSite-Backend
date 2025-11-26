import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  getRecentReviews,
  getPaginatedReviews,
  getReviewsByVideoId,
  createReview,
  updateReview,
  deleteReview,
} from "../modules/reviews/reviews.controller.js";
import {
  createReviewSchema,
  updateReviewSchema,
  paginatedReviewsSchema,
  recentReviewsSchema,
} from "../modules/reviews/reviews.validators.js";

const router = Router();

// Get recent reviews (public)
router.get(
  "/recent",
  validateRequest(recentReviewsSchema, "query"),
  getRecentReviews,
);

// Get paginated reviews (public)
router.get(
  "/paginated",
  validateRequest(paginatedReviewsSchema, "query"),
  getPaginatedReviews,
);

// Get reviews by video ID (public)
router.get("/video/:videoId", getReviewsByVideoId);

// Create review (authenticated)
router.post(
  "/",
  authenticateToken,
  validateRequest(createReviewSchema, "body"),
  createReview,
);

// Update review (authenticated - owner only)
router.put(
  "/:reviewId",
  authenticateToken,
  validateRequest(updateReviewSchema, "body"),
  updateReview,
);

// Delete review (authenticated - owner only)
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;


