import express from "express";

import {
  addReview,
  getReviewsByVideoId,
  updateReview,
  deleteReview,getPaginatedReviews,
  getRecentReviews,
} from "./reviews.controller.js";

const router = express.Router();

router.post("/", addReview);
router.get("/recent", getRecentReviews); // New Route
router.get("/paginated", getPaginatedReviews); // Paginated reviews
router.get("/video/:videoId", getReviewsByVideoId);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;
