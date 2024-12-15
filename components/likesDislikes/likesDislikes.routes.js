import express from "express";

import likesDislikesController from "./likesDislikes.controller.js";

const router = express.Router();

router.post("/", likesDislikesController.addOrUpdateLikeDislike);
router.get(
  "/:target_id/:target_type",
  likesDislikesController.getLikesDislikesCount
);

export default router;
