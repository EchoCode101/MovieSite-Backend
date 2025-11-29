import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface LikeDislike extends Document {
  user_id: Types.ObjectId;
  target_id: Types.ObjectId;
  target_type: "comment" | "review" | "video" | "movie" | "tvshow" | "episode" | "comment_reply";
  is_like: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const likesDislikesSchema = new Schema<LikeDislike>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    target_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    target_type: {
      type: String,
      required: true,
      enum: ["comment", "review", "video", "movie", "tvshow", "episode", "comment_reply"],
    },
    is_like: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "likesdislikes",
  },
);

likesDislikesSchema.index({ user_id: 1, target_id: 1, target_type: 1 }, { unique: true });
likesDislikesSchema.index({ target_id: 1, target_type: 1 });
likesDislikesSchema.index({ user_id: 1 });

export const LikeDislikeModel = mongoose.model<LikeDislike>("LikesDislikes", likesDislikesSchema);


