import mongoose, { type Document, Schema, type Types } from "mongoose";

export type DeviceType = "web" | "mobile" | "tv";
export type PositionType = "home" | "movie" | "tv" | "video";
export type BannerTargetType = "movie" | "tvshow" | "episode";

export interface Banner extends Document {
  title?: string;
  device: DeviceType;
  position: PositionType;
  target_type: BannerTargetType;
  target_id: Types.ObjectId;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<Banner>(
  {
    title: {
      type: String,
    },
    device: {
      type: String,
      enum: ["web", "mobile", "tv"],
      default: "web",
    },
    position: {
      type: String,
      enum: ["home", "movie", "tv", "video"],
      default: "home",
    },
    target_type: {
      type: String,
      enum: ["movie", "tvshow", "episode"],
      required: true,
    },
    target_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "banners",
  },
);

bannerSchema.index({ device: 1, position: 1, is_active: 1 });
bannerSchema.index({ sort_order: 1 });

export const BannerModel = mongoose.model<Banner>("Banners", bannerSchema);

