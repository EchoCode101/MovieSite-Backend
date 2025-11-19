import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    video_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
commentSchema.index({ video_id: 1 });
commentSchema.index({ member_id: 1 });
commentSchema.index({ createdAt: -1 });

const Comments = mongoose.model("Comments", commentSchema);

export default Comments;
