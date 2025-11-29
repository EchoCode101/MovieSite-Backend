import mongoose, { type Document, Schema, type Types } from "mongoose";

export type AccessType = "free" | "subscription" | "pay_per_view";
export type ContentStatus = "draft" | "published";

export interface TvShow extends Document {
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_year?: number;
  genres: Types.ObjectId[];
  cast: Types.ObjectId[];
  directors: Types.ObjectId[];
  access_type: AccessType;
  plan_ids: Types.ObjectId[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  custom_metadata?: Record<string, unknown>;
  status: ContentStatus;
  created_by?: Types.ObjectId;
  updated_by?: Types.ObjectId;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tvShowSchema = new Schema<TvShow>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    thumbnail_url: {
      type: String,
    },
    poster_url: {
      type: String,
    },
    banner_url: {
      type: String,
    },
    language: {
      type: String,
    },
    imdb_rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    content_rating: {
      type: String,
    },
    release_year: {
      type: Number,
    },
    genres: [
      {
        type: Schema.Types.ObjectId,
        ref: "Genre",
      },
    ],
    cast: [
      {
        type: Schema.Types.ObjectId,
        ref: "CastCrew",
      },
    ],
    directors: [
      {
        type: Schema.Types.ObjectId,
        ref: "CastCrew",
      },
    ],
    access_type: {
      type: String,
      enum: ["free", "subscription", "pay_per_view"],
      default: "subscription",
    },
    plan_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
    ],
    seo_title: {
      type: String,
    },
    seo_description: {
      type: String,
    },
    seo_keywords: {
      type: [String],
      default: [],
    },
    custom_metadata: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Admins",
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "Admins",
    },
    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "tvshows",
  },
);

// slug index is automatically created by unique: true
tvShowSchema.index({ title: 1 });
tvShowSchema.index({ genres: 1 });
tvShowSchema.index({ release_year: 1 });
tvShowSchema.index({ deleted_at: 1 });

export const TvShowModel = mongoose.model<TvShow>("TvShows", tvShowSchema);

