import mongoose from "mongoose";

const videoTagsSchema = new mongoose.Schema(
  {
    video_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      required: true,
    },
    tag_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tags",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index to prevent duplicate video-tag pairs
videoTagsSchema.index({ video_id: 1, tag_id: 1 }, { unique: true });

// Create indexes for better query performance
videoTagsSchema.index({ tag_id: 1 });

const VideoTags = mongoose.model("VideoTags", videoTagsSchema);

export default VideoTags;
