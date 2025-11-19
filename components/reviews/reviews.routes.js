import express from "express";
import { authenticateToken } from "../auth/authMiddleware.js";
import {
  addReview,
  getReviewsByVideoId,
  updateReview,
  deleteReview,
  getPaginatedReviews,
  getRecentReviews,
} from "./reviews.controller.js";

const router = express.Router();

router.post("/", authenticateToken, addReview);
router.get("/recent", getRecentReviews); // New Route
router.get("/paginated", getPaginatedReviews); // Paginated reviews
router.get("/video/:videoId", getReviewsByVideoId);
router.put("/:reviewId", authenticateToken, updateReview);
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;
