import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface PasswordReset extends Document {
  reset_token: string;
  reset_token_expiration: Date;
  user_id: Types.ObjectId;
  user_type: "admin" | "user";
  used_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSchema = new Schema<PasswordReset>(
  {
    reset_token: {
      type: String,
      required: true,
      unique: true,
      maxlength: 512,
    },
    reset_token_expiration: {
      type: Date,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
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
    collection: "passwordresets",
  },
);

passwordResetSchema.index({ user_id: 1, user_type: 1 });
passwordResetSchema.index({ reset_token_expiration: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = mongoose.model<PasswordReset>("PasswordResets", passwordResetSchema);

