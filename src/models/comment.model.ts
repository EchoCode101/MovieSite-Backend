import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface Comment extends Document {
  member_id: Types.ObjectId;
  video_id: Types.ObjectId;
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
    video_id: {
      type: Schema.Types.ObjectId,
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
    collection: "comments",
  },
);

commentSchema.index({ video_id: 1 });
commentSchema.index({ member_id: 1 });
commentSchema.index({ createdAt: -1 });

export const CommentModel = mongoose.model<Comment>("Comments", commentSchema);


