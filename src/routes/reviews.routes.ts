import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  getRecentReviews,
  getPaginatedReviews,
  getReviewsByVideo,
  getReviewsByTarget,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  bulkDeleteReviews,
} from "../modules/reviews/reviews.controller.js";
import {
  createReviewSchema,
  updateReviewSchema,
  paginatedReviewsSchema,
  recentReviewsSchema,
  bulkDeleteReviewsSchema,
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

// Get reviews by video ID (public) - legacy endpoint
router.get("/video/:videoId", getReviewsByVideo);

// Get reviews by target type and ID (public)
router.get("/target/:targetType/:targetId", getReviewsByTarget);

// Get user's own reviews (authenticated) - must be before parameterized routes
router.get(
  "/my",
  authenticateToken,
  validateRequest(paginatedReviewsSchema, "query"),
  getMyReviews,
);

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

// Bulk delete reviews (authenticated - admin or owner)
router.delete(
  "/bulk",
  authenticateToken,
  validateRequest(bulkDeleteReviewsSchema, "body"),
  bulkDeleteReviews,
);

// Delete review (authenticated - owner only)
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;


