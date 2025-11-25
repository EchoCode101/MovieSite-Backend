import express from "express";
import { authenticateToken } from "../auth/authMiddleware.js";
import {
  addOrUpdateLikeDislike,
  getLikesDislikesCount,
  getUserReaction,
  getReviewsWithLikesDislikes,
} from "./likesDislikes.controller.js";

const router = express.Router();

router.post("/", authenticateToken, addOrUpdateLikeDislike);
router.get("/reviews-with-likes-dislikes", getReviewsWithLikesDislikes);
router.get("/user/:target_type/:target_id", authenticateToken, getUserReaction);
router.get("/:target_type/:target_id", getLikesDislikesCount);

export default router;
