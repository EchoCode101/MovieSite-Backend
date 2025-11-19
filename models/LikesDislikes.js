import mongoose from "mongoose";

const likesDislikesSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    target_type: {
      type: String,
      required: true,
      enum: ["comment", "review", "video", "comment_reply"],
    },
    is_like: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index to prevent duplicate likes/dislikes
likesDislikesSchema.index(
  { user_id: 1, target_id: 1, target_type: 1 },
  { unique: true }
);

// Create indexes for better query performance
likesDislikesSchema.index({ target_id: 1, target_type: 1 });
likesDislikesSchema.index({ user_id: 1 });

const LikesDislikes = mongoose.model("LikesDislikes", likesDislikesSchema);

export default LikesDislikes;
