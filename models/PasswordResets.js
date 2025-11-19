import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    reset_token: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    reset_token_expiration: {
      type: Date,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user_type: {
      type: String,
      required: true,
      enum: ["admin", "user"],
    },
    used_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index is automatically created by unique: true in field definition
passwordResetSchema.index({ user_id: 1, user_type: 1 });

// TTL index to auto-delete expired tokens after 24 hours
passwordResetSchema.index(
  { reset_token_expiration: 1 },
  { expireAfterSeconds: 0 }
);

const PasswordResets = mongoose.model("PasswordResets", passwordResetSchema);

export default PasswordResets;
