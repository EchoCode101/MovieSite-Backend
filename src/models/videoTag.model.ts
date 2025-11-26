import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface VideoTag extends Document {
  video_id: Types.ObjectId;
  tag_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoTagSchema = new Schema<VideoTag>(
  {
    video_id: {
      type: Schema.Types.ObjectId,
      ref: "Videos",
      required: true,
    },
    tag_id: {
      type: Schema.Types.ObjectId,
      ref: "Tags",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "videotags",
  },
);

// Create compound unique index to prevent duplicate video-tag pairs
videoTagSchema.index({ video_id: 1, tag_id: 1 }, { unique: true });

// Create indexes for better query performance
videoTagSchema.index({ tag_id: 1 });

export const VideoTagModel = mongoose.model<VideoTag>("VideoTags", videoTagSchema);

