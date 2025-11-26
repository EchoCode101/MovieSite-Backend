import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface UserSessionHistory extends Document {
  user_id: Types.ObjectId;
  login_time: Date;
  logout_time?: Date;
  ip_address?: string;
  device_info?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSessionHistorySchema = new Schema<UserSessionHistory>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    login_time: {
      type: Date,
      default: Date.now,
    },
    logout_time: {
      type: Date,
    },
    ip_address: {
      type: String,
      maxlength: 100,
    },
    device_info: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "usersessionhistories",
  },
);

userSessionHistorySchema.index({ user_id: 1 });
userSessionHistorySchema.index({ login_time: -1 });
userSessionHistorySchema.index({ is_active: 1 });

export const UserSessionHistoryModel = mongoose.model<UserSessionHistory>(
  "UserSessionHistory",
  userSessionHistorySchema,
);

