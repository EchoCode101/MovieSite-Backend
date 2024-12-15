import express from "express";

import reviewsController from "./reviews.controller.js";

const router = express.Router();

router.post("/", reviewsController.addReview);
router.get("/video/:videoId", reviewsController.getReviewsByVideoId);
router.put("/:reviewId", reviewsController.updateReview);
router.delete("/:reviewId", reviewsController.deleteReview);

export default router;
