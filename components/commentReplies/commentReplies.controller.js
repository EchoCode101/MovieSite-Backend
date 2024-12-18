import { CommentReplies } from "../../models/index.js";
// Add a reply
export const addReply = async (req, res) => {
  const { comment_id, user_id, content } = req.body;
  if (!comment_id || !user_id || !content) {
    return res.status(400).json({
      error: "All fields are required: comment_id, user_id, and content.",
    });
  }

  try {
    const newReply = await CommentReplies.create({
      comment_id,
      user_id,
      content,
    });

    res.status(201).json(newReply);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get replies for a comment
export const getRepliesByCommentId = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const replies = await CommentReplies.findAll({
      where: { comment_id },
      order: [["created_at", "ASC"]],
    });

    res.status(200).json(replies);
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a reply
export const deleteReply = async (req, res) => {
  const { reply_id } = req.params;

  try {
    const deletedReply = await CommentReplies.destroy({
      where: { reply_id },
      returning: true,
    });

    if (!deletedReply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ error: error.message });
  }
};
