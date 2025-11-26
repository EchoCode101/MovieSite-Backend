import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface Profile extends Document {
  user_id: Types.ObjectId;
  name: string;
  avatar_url?: string;
  is_kid: boolean;
  language: string;
  pin?: string;
  autoplay_next: boolean;
  autoplay_trailers: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<Profile>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "Members", required: true },
    name: { type: String, required: true },
    avatar_url: { type: String },
    is_kid: { type: Boolean, default: false },
    language: { type: String, default: "en" },
    pin: { type: String },
    autoplay_next: { type: Boolean, default: true },
    autoplay_trailers: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "profiles",
  },
);

profileSchema.index({ user_id: 1 });

export const ProfileModel = mongoose.model<Profile>("Profiles", profileSchema);


