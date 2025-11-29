import mongoose, { type Document, Schema, type Types } from "mongoose";

export type ContentStatus = "draft" | "published";

export interface Season extends Document {
  tv_show_id: Types.ObjectId;
  season_number: number;
  name?: string;
  description?: string;
  poster_url?: string;
  release_date?: Date;
  seo_title?: string;
  seo_description?: string;
  status: ContentStatus;
  created_by?: Types.ObjectId;
  updated_by?: Types.ObjectId;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const seasonSchema = new Schema<Season>(
  {
    tv_show_id: {
      type: Schema.Types.ObjectId,
      ref: "TvShows",
      required: true,
    },
    season_number: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    poster_url: {
      type: String,
    },
    release_date: {
      type: Date,
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
    collection: "seasons",
  },
);

seasonSchema.index({ tv_show_id: 1, season_number: 1 }, { unique: true });
seasonSchema.index({ tv_show_id: 1 });
seasonSchema.index({ deleted_at: 1 });

export const SeasonModel = mongoose.model<Season>("Seasons", seasonSchema);

