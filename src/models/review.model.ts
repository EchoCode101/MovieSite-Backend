import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface Review extends Document {
  video_id: Types.ObjectId;
  member_id: Types.ObjectId;
  rating: number;
  review_content?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<Review>(
  {
    video_id: {
      type: Schema.Types.ObjectId,
      ref: "Videos",
      required: true,
    },
    member_id: {
      type: Schema.Types.ObjectId,
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
    collection: "reviewsandratings",
  },
);

reviewSchema.index({ video_id: 1 });
reviewSchema.index({ member_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ video_id: 1, member_id: 1 }, { unique: true });

export const ReviewModel = mongoose.model<Review>("ReviewsAndRatings", reviewSchema);


