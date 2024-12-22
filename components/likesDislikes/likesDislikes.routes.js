import express from "express";

import {
  addOrUpdateLikeDislike,
  getLikesDislikesCount,
  getReviewsWithLikesDislikes,
} from "./likesDislikes.controller.js";

const router = express.Router();

router.post("/", addOrUpdateLikeDislike);
router.get("/reviews-with-likes-dislikes", getReviewsWithLikesDislikes);
router.get("/:target_id/:target_type", getLikesDislikesCount);

export default router;
