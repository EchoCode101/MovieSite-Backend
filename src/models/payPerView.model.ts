import mongoose, { type Document, Schema, type Types } from "mongoose";

export type PayPerViewTargetType = "movie" | "episode";
export type PurchaseType = "rent" | "buy";

export interface PayPerView extends Document {
  user_id: Types.ObjectId;
  target_type: PayPerViewTargetType;
  target_id: Types.ObjectId;
  price: number;
  currency: string;
  purchase_type: PurchaseType;
  access_duration_hours?: number;
  purchased_at: Date;
  expires_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payPerViewSchema = new Schema<PayPerView>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    target_type: {
      type: String,
      enum: ["movie", "episode"],
      required: true,
    },
    target_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    purchase_type: {
      type: String,
      enum: ["rent", "buy"],
      default: "rent",
    },
    access_duration_hours: {
      type: Number,
    },
    purchased_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "payperviews",
  },
);

payPerViewSchema.index({ user_id: 1, target_type: 1, target_id: 1 });
payPerViewSchema.index({ expires_at: 1 });

export const PayPerViewModel = mongoose.model<PayPerView>(
  "PayPerView",
  payPerViewSchema,
);

