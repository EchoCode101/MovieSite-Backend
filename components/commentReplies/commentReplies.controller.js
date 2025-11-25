import {
  CommentReplies,
  Comments,
  Members,
  Notifications,
} from "../../models/index.js";
import createError from "http-errors";

// Add a reply
export const addReply = async (req, res, next) => {
  const { comment_id, reply_content } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!comment_id || !reply_content) {
    return next(createError(400, "comment_id and reply_content are required"));
  }

  if (typeof reply_content !== "string" || reply_content.trim().length === 0) {
    return next(createError(400, "reply_content must be a non-empty string"));
  }

  try {
    // Verify comment exists
    const comment = await Comments.findById(comment_id);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    const savedReply = await CommentReplies.create({
      comment_id,
      member_id,
      reply_content: reply_content.trim(),
    });

    // Notification Logic
    if (comment && comment.member_id.toString() !== member_id) {
      await Notifications.create({
        recipient_id: comment.member_id,
        sender_id: member_id,
        type: "reply",
        reference_id: savedReply._id,
        reference_type: "Comments", // Linking to the comment implies the reply context
        message: `replied to your comment: "${comment.content.substring(0, 30)}..."`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: savedReply,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get replies for a comment
export const getRepliesByCommentId = async (req, res, next) => {
  const { comment_id } = req.params;

  try {
    const replies = await CommentReplies.find({ comment_id }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      message: "Replies retrieved successfully",
      data: replies,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Update a reply
export const updateReply = async (req, res, next) => {
  const { reply_id } = req.params;
  const { reply_content } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!reply_content) {
    return next(createError(400, "reply_content is required"));
  }

  if (typeof reply_content !== "string" || reply_content.trim().length === 0) {
    return next(createError(400, "reply_content must be a non-empty string"));
  }

  try {
    const reply = await CommentReplies.findById(reply_id);
    if (!reply) {
      return next(createError(404, "Reply not found"));
    }

    // Check ownership
    if (reply.member_id.toString() !== member_id) {
      return next(createError(403, "You can only update your own replies"));
    }

    const updatedReply = await CommentReplies.findByIdAndUpdate(
      reply_id,
      { reply_content: reply_content.trim() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      data: updatedReply,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Delete a reply
export const deleteReply = async (req, res, next) => {
  const { reply_id } = req.params;
  const member_id = req.user.id; // Extract from authenticated token

  try {
    const reply = await CommentReplies.findById(reply_id);

    if (!reply) {
      return next(createError(404, "Reply not found"));
    }

    // Check ownership
    if (reply.member_id.toString() !== member_id) {
      return next(createError(403, "You can only delete your own replies"));
    }

    await CommentReplies.findByIdAndDelete(reply_id);

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};
