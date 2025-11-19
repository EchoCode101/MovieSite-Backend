import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String,
    },
    video_url: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
    },
    resolution: {
      type: String,
      maxlength: 20,
    },
    file_size: {
      type: Number,
    },
    video_url_encrypted: {
      type: String,
    },
    access_level: {
      type: String,
      default: "Free",
      maxlength: 50,
    },
    category: {
      type: String,
      maxlength: 100,
    },
    language: {
      type: String,
      maxlength: 50,
    },
    thumbnail_url: {
      type: String,
    },
    age_restriction: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    video_format: {
      type: String,
      maxlength: 50,
    },
    license_type: {
      type: String,
      maxlength: 100,
    },
    seo_title: {
      type: String,
      maxlength: 255,
    },
    seo_description: {
      type: String,
    },
    custom_metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tags",
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
videoSchema.index({ title: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ published: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ updatedAt: -1 });
videoSchema.index({ created_by: 1 });

const Videos = mongoose.model("Videos", videoSchema);

export default Videos;
