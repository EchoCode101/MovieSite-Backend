import mongoose, { type Document, Schema } from "mongoose";

export interface PaymentMethod extends Document {
  name: string;
  display_name?: string;
  config: Record<string, unknown>;
  is_active: boolean;
  is_default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<PaymentMethod>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    display_name: {
      type: String,
      trim: true,
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "paymentmethods",
  },
);

// name index is automatically created by unique: true
paymentMethodSchema.index({ is_active: 1 });
paymentMethodSchema.index({ is_default: 1 });

export const PaymentMethodModel = mongoose.model<PaymentMethod>(
  "PaymentMethods",
  paymentMethodSchema,
);

