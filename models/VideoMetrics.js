import mongoose from "mongoose";

const videoMetricsSchema = new mongoose.Schema(
  {
    video_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      required: true,
    },
    views_count: {
      type: Number,
      default: 0,
    },
    shares_count: {
      type: Number,
      default: 0,
    },
    favorites_count: {
      type: Number,
      default: 0,
    },
    report_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
videoMetricsSchema.index({ video_id: 1 }, { unique: true });

const VideoMetrics = mongoose.model("VideoMetrics", videoMetricsSchema);

export default VideoMetrics;
