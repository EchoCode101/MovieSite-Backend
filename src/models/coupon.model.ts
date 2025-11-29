import mongoose, { type Document, Schema, type Types } from "mongoose";

export type DiscountType = "fixed" | "percent";

export interface Coupon extends Document {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses?: number;
  max_uses_per_user?: number;
  valid_from?: Date;
  valid_until?: Date;
  applicable_plan_ids: Types.ObjectId[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<Coupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    discount_type: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0,
    },
    max_uses: {
      type: Number,
    },
    max_uses_per_user: {
      type: Number,
    },
    valid_from: {
      type: Date,
    },
    valid_until: {
      type: Date,
    },
    applicable_plan_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "coupons",
  },
);

// code index is automatically created by unique: true
couponSchema.index({ is_active: 1, valid_from: 1, valid_until: 1 });

export const CouponModel = mongoose.model<Coupon>("Coupon", couponSchema);

