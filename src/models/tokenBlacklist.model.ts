import mongoose, { type Document, Schema } from "mongoose";

export interface TokenBlacklist extends Document {
  token: string;
  expires_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenBlacklistSchema = new Schema<TokenBlacklist>(
  {
    token: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tokenblacklists",
  },
);

tokenBlacklistSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklistModel = mongoose.model<TokenBlacklist>("TokenBlacklist", tokenBlacklistSchema);

