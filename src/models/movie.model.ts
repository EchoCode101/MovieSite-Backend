import mongoose, { type Document, Schema, type Types } from "mongoose";

export type AccessType = "free" | "subscription" | "pay_per_view";
export type PurchaseType = "rent" | "buy";
export type TrailerUrlType = "youtube" | "vimeo" | "mp4" | "hls";
export type ContentStatus = "draft" | "published";

export interface Stream {
  label?: string;
  type?: string;
  url: string;
}

export interface Movie extends Document {
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  trailer_url_type: TrailerUrlType;
  trailer_url?: string;
  streams: Stream[];
  access_type: AccessType;
  plan_ids: Types.ObjectId[];
  pay_per_view_price?: number;
  purchase_type: PurchaseType;
  access_duration_hours?: number;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_date?: Date;
  duration_minutes?: number;
  genres: Types.ObjectId[];
  cast: Types.ObjectId[];
  directors: Types.ObjectId[];
  tags: Types.ObjectId[];
  is_premium: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_coming_soon: boolean;
  is_downloadable: boolean;
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

const streamSchema = new Schema<Stream>(
  {
    label: { type: String },
    type: { type: String },
    url: { type: String, required: true },
  },
  { _id: false },
);

const movieSchema = new Schema<Movie>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
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
    short_description: {
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
    trailer_url_type: {
      type: String,
      enum: ["youtube", "vimeo", "mp4", "hls"],
      default: "youtube",
    },
    trailer_url: {
      type: String,
    },
    streams: {
      type: [streamSchema],
      default: [],
    },
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
    pay_per_view_price: {
      type: Number,
    },
    purchase_type: {
      type: String,
      enum: ["rent", "buy"],
      default: "rent",
    },
    access_duration_hours: {
      type: Number,
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
    release_date: {
      type: Date,
    },
    duration_minutes: {
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
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tags",
      },
    ],
    is_premium: {
      type: Boolean,
      default: false,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_trending: {
      type: Boolean,
      default: false,
    },
    is_coming_soon: {
      type: Boolean,
      default: false,
    },
    is_downloadable: {
      type: Boolean,
      default: false,
    },
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
    collection: "movies",
  },
);

// slug index is automatically created by unique: true
movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ is_trending: 1 });
movieSchema.index({ is_featured: 1 });
movieSchema.index({ release_date: 1 });
movieSchema.index({ access_type: 1 });
movieSchema.index({ deleted_at: 1 });

export const MovieModel = mongoose.model<Movie>("Movies", movieSchema);

