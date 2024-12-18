import express from "express";
import {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
  getPaginatedComments,
} from "./comments.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
const router = express.Router();

router.post("/", createComment); // Create a new comment
router.get("/", authenticateAdminToken, getAllComments); // Get all comments
router.get("/paginated", authenticateAdminToken, getPaginatedComments);
router.get("/:id", getCommentById); // Get a specific comment by ID
router.put("/:id", updateComment); // Update a comment
router.delete("/:id", deleteComment); // Delete a comment

export default router;
