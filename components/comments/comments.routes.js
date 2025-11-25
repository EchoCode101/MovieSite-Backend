import express from "express";
import {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
  bulkDeleteComments,
  getPaginatedComments,
  getCommentsByVideoId,
} from "./comments.controller.js";
import {
  authenticateAdminToken,
  authenticateToken,
} from "../auth/authMiddleware.js";
const router = express.Router();

router.post("/", authenticateToken, createComment); // Create a new comment
router.get("/", authenticateAdminToken, getAllComments); // Get all comments
router.get("/paginated", authenticateAdminToken, getPaginatedComments);
router.get("/:id", getCommentById); // Get a specific comment by comment ID
router.put("/:id", authenticateToken, updateComment); // Update a comment
router.delete("/bulk", authenticateToken, bulkDeleteComments); // Bulk delete
router.delete("/:id", authenticateToken, deleteComment); // Delete a comment

router.get("/video/:videoId", getCommentsByVideoId); // Get video specific comments by video ID

export default router;
