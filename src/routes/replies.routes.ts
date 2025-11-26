import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
    getRepliesByCommentId,
    createReply,
    updateReply,
    deleteReply,
} from "../modules/commentReplies/commentReplies.controller.js";
import {
    createReplySchema,
    updateReplySchema,
} from "../modules/commentReplies/commentReplies.validators.js";

const router = Router();

// Get replies by comment ID (public) - legacy route pattern
router.get("/:comment_id", getRepliesByCommentId);

// Get replies by comment ID (public) - alternative route pattern
router.get("/comment/:comment_id", getRepliesByCommentId);

// Create reply (authenticated)
router.post(
    "/",
    authenticateToken,
    validateRequest(createReplySchema, "body"),
    createReply,
);

// Update reply (authenticated - owner only)
router.put(
    "/:reply_id",
    authenticateToken,
    validateRequest(updateReplySchema, "body"),
    updateReply,
);

// Delete reply (authenticated - owner only)
router.delete("/:reply_id", authenticateToken, deleteReply);

export default router;


