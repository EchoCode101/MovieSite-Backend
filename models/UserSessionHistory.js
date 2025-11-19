import mongoose from "mongoose";

const userSessionHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
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
  }
);

// Create indexes
userSessionHistorySchema.index({ user_id: 1 });
userSessionHistorySchema.index({ login_time: -1 });
userSessionHistorySchema.index({ is_active: 1 });

const UserSessionHistory = mongoose.model(
  "UserSessionHistory",
  userSessionHistorySchema
);

export default UserSessionHistory;
