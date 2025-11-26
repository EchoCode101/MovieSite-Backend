import mongoose, { type Document, Schema, type Types } from "mongoose";

export type WatchTargetType = "movie" | "tvshow" | "episode";

export interface WatchlistItem extends Document {
  user_id: Types.ObjectId;
  profile_id: Types.ObjectId;
  target_type: WatchTargetType;
  target_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<WatchlistItem>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "Members", required: true },
    profile_id: { type: Schema.Types.ObjectId, ref: "Profiles", required: true },
    target_type: {
      type: String,
      enum: ["movie", "tvshow", "episode"],
      required: true,
    },
    target_id: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    collection: "watchlists",
  },
);

watchlistSchema.index(
  { user_id: 1, profile_id: 1, target_type: 1, target_id: 1 },
  { unique: true },
);

export const WatchlistModel = mongoose.model<WatchlistItem>("Watchlists", watchlistSchema);


