import mongoose from "mongoose";

const commentReplySchema = new mongoose.Schema(
  {
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
      required: true,
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    reply_content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
commentReplySchema.index({ comment_id: 1 });
commentReplySchema.index({ member_id: 1 });
commentReplySchema.index({ createdAt: -1 });

const CommentReplies = mongoose.model("CommentReplies", commentReplySchema);

export default CommentReplies;
