import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface VideoMetric extends Document {
  video_id: Types.ObjectId;
  views_count: number;
  shares_count: number;
  favorites_count: number;
  report_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const videoMetricsSchema = new Schema<VideoMetric>(
  {
    video_id: {
      type: Schema.Types.ObjectId,
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
    collection: "videometrics",
  },
);

videoMetricsSchema.index({ video_id: 1 }, { unique: true });

export const VideoMetricModel = mongoose.model<VideoMetric>("VideoMetrics", videoMetricsSchema);


