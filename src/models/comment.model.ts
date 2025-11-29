import mongoose, { type Document, Schema, type Types } from "mongoose";

export type CommentTargetType = "video" | "movie" | "tvshow" | "episode";

export interface Comment extends Document {
  member_id: Types.ObjectId;
  target_type: CommentTargetType;
  target_id: Types.ObjectId;
  content: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<Comment>(
  {
    member_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    target_type: {
      type: String,
      enum: ["video", "movie", "tvshow", "episode"],
      required: true,
    },
    target_id: {
      type: Schema.Types.ObjectId,
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
    collection: "comments",
  },
);

commentSchema.index({ target_type: 1, target_id: 1 });
commentSchema.index({ member_id: 1 });
commentSchema.index({ createdAt: -1 });

export const CommentModel = mongoose.model<Comment>("Comments", commentSchema);


