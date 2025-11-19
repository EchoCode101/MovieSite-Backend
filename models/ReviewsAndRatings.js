import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    video_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      required: true,
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    review_content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
reviewSchema.index({ video_id: 1 });
reviewSchema.index({ member_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per user per video
reviewSchema.index({ video_id: 1, member_id: 1 }, { unique: true });

const ReviewsAndRatings = mongoose.model("ReviewsAndRatings", reviewSchema);

export default ReviewsAndRatings;
