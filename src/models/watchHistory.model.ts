import mongoose, { type Document, Schema, type Types } from "mongoose";

export type WatchHistoryTargetType = "movie" | "episode";

export interface WatchHistoryItem extends Document {
  user_id: Types.ObjectId;
  profile_id: Types.ObjectId;
  target_type: WatchHistoryTargetType;
  target_id: Types.ObjectId;
  watched_seconds: number;
  total_seconds: number;
  last_watched_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const watchHistorySchema = new Schema<WatchHistoryItem>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "Members", required: true },
    profile_id: { type: Schema.Types.ObjectId, ref: "Profiles", required: true },
    target_type: {
      type: String,
      enum: ["movie", "episode"],
      required: true,
    },
    target_id: { type: Schema.Types.ObjectId, required: true },
    watched_seconds: { type: Number, default: 0 },
    total_seconds: { type: Number, default: 0 },
    last_watched_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "watchhistories",
  },
);

watchHistorySchema.index(
  { user_id: 1, profile_id: 1, target_type: 1, target_id: 1 },
  { unique: true },
);

export const WatchHistoryModel = mongoose.model<WatchHistoryItem>("WatchHistory", watchHistorySchema);


