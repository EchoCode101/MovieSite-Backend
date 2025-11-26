import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface Video extends Document {
  title: string;
  description?: string;
  video_url: string;
  duration?: number;
  resolution?: string;
  file_size?: number;
  video_url_encrypted?: string;
  access_level: string;
  category?: string;
  language?: string;
  thumbnail_url?: string;
  age_restriction: boolean;
  published: boolean;
  video_format?: string;
  license_type?: string;
  seo_title?: string;
  seo_description?: string;
  custom_metadata?: Record<string, unknown>;
  tags: Types.ObjectId[];
  created_by?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<Video>(
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
      type: Schema.Types.Mixed,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tags",
      },
    ],
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Members",
    },
  },
  {
    timestamps: true,
    collection: "videos",
  },
);

videoSchema.index({ title: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ published: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ updatedAt: -1 });
videoSchema.index({ created_by: 1 });

export const VideoModel = mongoose.model<Video>("Videos", videoSchema);


