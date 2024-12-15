import express from "express";
import commentsController from "./comments.controller.js";

const router = express.Router();

router.post("/", commentsController.createComment); // Create a new comment
router.get("/", commentsController.getAllComments); // Get all comments
router.get("/:id", commentsController.getCommentById); // Get a specific comment by ID
router.put("/:id", commentsController.updateComment); // Update a comment
router.delete("/:id", commentsController.deleteComment); // Delete a comment

export default router;
