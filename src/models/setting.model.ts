import mongoose, { type Document, Schema } from "mongoose";

export type SettingGroup =
  | "app"
  | "payment"
  | "auth"
  | "firebase"
  | "ads"
  | "tmdb"
  | "mail"
  | "seo";

export interface Setting extends Document {
  key: string;
  value: unknown;
  group: SettingGroup;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<Setting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: ["app", "payment", "auth", "firebase", "ads", "tmdb", "mail", "seo"],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "settings",
  },
);

// key index is automatically created by unique: true
settingSchema.index({ group: 1 });

export const SettingModel = mongoose.model<Setting>("Settings", settingSchema);

