import mongoose, { type Document, Schema, type Types } from "mongoose";

export type ReportTargetType = "video" | "movie" | "tvshow" | "episode" | "comment" | "review" | "user";
export type ReportStatus = "Pending" | "Reviewed" | "Resolved" | "Dismissed";

export interface Report extends Document {
  reporter_id: Types.ObjectId;
  target_id: Types.ObjectId;
  target_type: ReportTargetType;
  reason: "Spam" | "Harassment" | "Inappropriate Content" | "Hate Speech" | "Other";
  description?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reportsSchema = new Schema<Report>(
  {
    reporter_id: {
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
      enum: ["video", "movie", "tvshow", "episode", "comment", "review", "user"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ["Spam", "Harassment", "Inappropriate Content", "Hate Speech", "Other"],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved", "Dismissed"],
      default: "Pending",
    },
  },
  { timestamps: true, collection: "reports" },
);

export const ReportModel = mongoose.model<Report>("Reports", reportsSchema);


