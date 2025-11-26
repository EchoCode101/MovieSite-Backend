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
  getCommentsByVideoId,
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

// Get comment by ID (public)
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

// Get comments by video ID (public)
router.get("/video/:videoId", getCommentsByVideoId);

export default router;

