import mongoose, { type Document, Schema, type Types } from "mongoose";

export type AccessType = "free" | "subscription" | "pay_per_view";
export type ContentStatus = "draft" | "published";

export interface Stream {
  label?: string;
  type?: string;
  url: string;
}

export interface Subtitle {
  language: string;
  is_default: boolean;
  url: string;
}

export interface Episode extends Document {
  tv_show_id: Types.ObjectId;
  season_id: Types.ObjectId;
  episode_number: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  streams: Stream[];
  enable_subtitle: boolean;
  subtitles: Subtitle[];
  duration_minutes?: number;
  release_date?: Date;
  access_type: AccessType;
  plan_ids: Types.ObjectId[];
  pay_per_view_price?: number;
  seo_title?: string;
  seo_description?: string;
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

const subtitleSchema = new Schema<Subtitle>(
  {
    language: { type: String, required: true },
    is_default: { type: Boolean, default: false },
    url: { type: String, required: true },
  },
  { _id: false },
);

const episodeSchema = new Schema<Episode>(
  {
    tv_show_id: {
      type: Schema.Types.ObjectId,
      ref: "TvShows",
      required: true,
    },
    season_id: {
      type: Schema.Types.ObjectId,
      ref: "Seasons",
      required: true,
    },
    episode_number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    thumbnail_url: {
      type: String,
    },
    streams: {
      type: [streamSchema],
      default: [],
    },
    enable_subtitle: {
      type: Boolean,
      default: false,
    },
    subtitles: {
      type: [subtitleSchema],
      default: [],
    },
    duration_minutes: {
      type: Number,
    },
    release_date: {
      type: Date,
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
    seo_title: {
      type: String,
    },
    seo_description: {
      type: String,
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
    collection: "episodes",
  },
);

episodeSchema.index({ tv_show_id: 1, season_id: 1, episode_number: 1 }, { unique: true });
episodeSchema.index({ tv_show_id: 1 });
episodeSchema.index({ season_id: 1 });
episodeSchema.index({ deleted_at: 1 });

export const EpisodeModel = mongoose.model<Episode>("Episodes", episodeSchema);

