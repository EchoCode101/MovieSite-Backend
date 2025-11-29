import mongoose, { type Document, Schema, type Types } from "mongoose";

export type DeviceType = "web" | "android" | "ios" | "tv";

export interface Device extends Document {
  user_id: Types.ObjectId;
  device_id: string;
  device_type?: DeviceType;
  device_name?: string;
  last_used_at: Date;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<Device>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    device_id: {
      type: String,
      required: true,
      unique: true,
    },
    device_type: {
      type: String,
      enum: ["web", "android", "ios", "tv"],
    },
    device_name: {
      type: String,
    },
    last_used_at: {
      type: Date,
      default: Date.now,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "devices",
  },
);

deviceSchema.index({ user_id: 1 });
// device_id index is automatically created by unique: true
deviceSchema.index({ user_id: 1, is_active: 1 });

export const DeviceModel = mongoose.model<Device>("Devices", deviceSchema);

