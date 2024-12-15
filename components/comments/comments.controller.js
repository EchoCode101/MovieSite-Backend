import commentsService from "./comments.service.js";

// Create a new comment
const createComment = async (req, res) => {
  try {
    const comment = await commentsService.createComment(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments
const getAllComments = async (req, res) => {
  try {
    const comments = await commentsService.getAllComments();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific comment by ID
const getCommentById = async (req, res) => {
  try {
    const comment = await commentsService.getCommentById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const comment = await commentsService.updateComment(
      req.params.id,
      req.body
    );
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await commentsService.deleteComment(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
