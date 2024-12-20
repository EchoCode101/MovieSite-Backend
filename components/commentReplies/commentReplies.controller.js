import { CommentReplies } from "../../models/index.js";
// Add a reply
export const addReply = async (req, res, next) => {
  const { comment_id, user_id, content } = req.body;
  if (!comment_id || !user_id || !content) {
    return next(
      createError(
        400,
        "All fields are required: comment_id, user_id, and content."
      )
    );
  }

  try {
    const newReply = await CommentReplies.create({
      comment_id,
      user_id,
      content,
    });

    res.status(201).json(newReply);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get replies for a comment
export const getRepliesByCommentId = async (req, res, next) => {
  const { comment_id } = req.params;

  try {
    const replies = await CommentReplies.findAll({
      where: { comment_id },
      order: [["created_at", "ASC"]],
    });

    res.status(200).json(replies);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Delete a reply
export const deleteReply = async (req, res, next) => {
  const { reply_id } = req.params;

  try {
    const deletedReply = await CommentReplies.destroy({
      where: { reply_id },
      returning: true,
    });

    if (!deletedReply) {
      return next(createError(404, "Reply not found"));
    }

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    next(createError(500, error.message));
  }
};
