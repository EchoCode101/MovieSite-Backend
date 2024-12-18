import express from "express";

import {
  addReview,
  getReviewsByVideoId,
  updateReview,
  deleteReview,
  getRecentReviews,
} from "./reviews.controller.js";

const router = express.Router();

router.post("/", addReview);
router.get("/recent", getRecentReviews); // New Route
router.get("/video/:videoId", getReviewsByVideoId);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;
