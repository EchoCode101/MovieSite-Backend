import express from "express";

import {
  addOrUpdateLikeDislike,
  getLikesDislikesCount,
} from "./likesDislikes.controller.js";

const router = express.Router();

router.post("/", addOrUpdateLikeDislike);
router.get("/:target_id/:target_type", getLikesDislikesCount);

export default router;
