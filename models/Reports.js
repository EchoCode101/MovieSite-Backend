import mongoose from "mongoose";

const ReportsSchema = new mongoose.Schema(
  {
    reporter_id: {
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
      enum: ["video", "comment", "review", "user"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Spam",
        "Harassment",
        "Inappropriate Content",
        "Hate Speech",
        "Other",
      ],
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
  { timestamps: true }
);

const Reports = mongoose.model("Reports", ReportsSchema);

export default Reports;
