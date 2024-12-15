import { Comments } from "../../SequelizeSchemas/schemas.js";

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const comment = await Comments.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comments.findAll({
      order: [["date_of_creation", "DESC"]],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific comment by ID
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updatedComment = await comment.update(req.body);
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
