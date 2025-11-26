import mongoose, { type Document, Schema, type Types } from "mongoose";

export type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Subscription extends Document {
  user_id: Types.ObjectId;
  plan_id: Types.ObjectId;
  status: SubscriptionStatus;
  started_at?: Date;
  ends_at?: Date;
  cancelled_at?: Date;
  base_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  coupon_id?: Types.ObjectId;
  payment_status: PaymentStatus;
  payment_transaction_id?: Types.ObjectId;
  is_manual: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<Subscription>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "Members", required: true },
    plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending",
    },
    started_at: { type: Date },
    ends_at: { type: Date },
    cancelled_at: { type: Date },
    base_amount: { type: Number, required: true },
    tax_amount: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon" },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    payment_transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    is_manual: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "subscriptions" },
);

subscriptionSchema.index({ user_id: 1, status: 1 });

export const SubscriptionModel = mongoose.model<Subscription>(
  "Subscriptions",
  subscriptionSchema,
);


