import { Router } from "express";

import {
  authenticateAdminToken,
  authenticateToken,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
  bulkDeleteComments,
  getPaginatedComments,
  getCommentsByVideo,
  getCommentsByTarget,
  getMyComments,
} from "../modules/comments/comments.controller.js";
import {
  createCommentSchema,
  updateCommentSchema,
  paginatedCommentsSchema,
  bulkDeleteCommentsSchema,
} from "../modules/comments/comments.validators.js";

const router = Router();

// Create comment (authenticated)
router.post(
  "/",
  authenticateToken,
  validateRequest(createCommentSchema, "body"),
  createComment,
);

// Get all comments (admin)
router.get("/", authenticateAdminToken, getAllComments);

// Get paginated comments (admin)
router.get(
  "/paginated",
  authenticateAdminToken,
  validateRequest(paginatedCommentsSchema, "query"),
  getPaginatedComments,
);

// Get user's own comments (authenticated) - must be before /:id route
router.get(
  "/my",
  authenticateToken,
  validateRequest(paginatedCommentsSchema, "query"),
  getMyComments,
);

// Get comments by video ID (public) - legacy endpoint
router.get("/video/:videoId", getCommentsByVideo);

// Get comments by target type and ID (public)
router.get("/target/:targetType/:targetId", getCommentsByTarget);

// Get comment by ID (public) - must be after all specific routes to avoid conflicts
router.get("/:id", getCommentById);

// Update comment (authenticated - owner only)
router.put(
  "/:id",
  authenticateToken,
  validateRequest(updateCommentSchema, "body"),
  updateComment,
);

// Bulk delete comments (authenticated - admin or owner)
router.delete(
  "/bulk",
  authenticateToken,
  validateRequest(bulkDeleteCommentsSchema, "body"),
  bulkDeleteComments,
);

// Delete comment (authenticated - owner only)
router.delete("/:id", authenticateToken, deleteComment);

export default router;

