import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
    addOrUpdateLikeDislike,
    getLikesDislikesCount,
    getUserReaction,
    getReviewsWithLikesDislikes,
} from "../modules/likesDislikes/likesDislikes.controller.js";
import { likeDislikeSchema } from "../modules/likesDislikes/likesDislikes.validators.js";

const router = Router();

// Add or update like/dislike (authenticated)
router.post(
    "/",
    authenticateToken,
    validateRequest(likeDislikeSchema, "body"),
    addOrUpdateLikeDislike,
);

// Get all reviews with likes/dislikes counts (public) - must come before /:target_type/:target_id
router.get("/reviews-with-likes-dislikes", getReviewsWithLikesDislikes);

// Get user's reaction for a specific target (authenticated) - must come before /:target_type/:target_id
router.get("/user/:target_type/:target_id", authenticateToken, getUserReaction);

// Get likes/dislikes count for a target (public) - legacy route pattern
router.get("/:target_type/:target_id", getLikesDislikesCount);

// Get likes/dislikes count for a target (public) - alternative route pattern
router.get("/count/:target_type/:target_id", getLikesDislikesCount);

export default router;


