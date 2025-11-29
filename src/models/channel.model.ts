import mongoose, { type Document, Schema, type Types } from "mongoose";

export type DeviceType = "web" | "mobile" | "tv";
export type StreamType = "hls" | "dash" | "mp4";

export interface Channel extends Document {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  stream_url?: string;
  stream_type?: StreamType;
  language?: string;
  country?: string;
  category?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_by?: Types.ObjectId;
  updated_by?: Types.ObjectId;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<Channel>(
  {
    name: {
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
    logo_url: {
      type: String,
    },
    banner_url: {
      type: String,
    },
    stream_url: {
      type: String,
    },
    stream_type: {
      type: String,
      enum: ["hls", "dash", "mp4"],
    },
    language: {
      type: String,
    },
    country: {
      type: String,
    },
    category: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    sort_order: {
      type: Number,
      default: 0,
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
    collection: "channels",
  },
);

// slug index is automatically created by unique: true
channelSchema.index({ is_active: 1 });
channelSchema.index({ is_featured: 1 });
channelSchema.index({ deleted_at: 1 });

export const ChannelModel = mongoose.model<Channel>("Channels", channelSchema);

