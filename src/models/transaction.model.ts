import mongoose, { type Document, Schema, type Types } from "mongoose";

export type TransactionType = "subscription" | "pay_per_view";
export type TransactionStatus = "pending" | "paid" | "failed" | "refunded";

export interface Transaction extends Document {
  user_id: Types.ObjectId;
  type: TransactionType;
  gateway: string;
  gateway_transaction_id?: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  subscription_id?: Types.ObjectId;
  ppv_id?: Types.ObjectId;
  raw_gateway_response?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<Transaction>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    type: {
      type: String,
      enum: ["subscription", "pay_per_view"],
      required: true,
    },
    gateway: {
      type: String,
      required: true,
    },
    gateway_transaction_id: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    subscription_id: {
      type: Schema.Types.ObjectId,
      ref: "Subscriptions",
    },
    ppv_id: {
      type: Schema.Types.ObjectId,
      ref: "PayPerView",
    },
    raw_gateway_response: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  },
);

transactionSchema.index({ user_id: 1, type: 1, status: 1 });
transactionSchema.index({ gateway_transaction_id: 1 });
transactionSchema.index({ subscription_id: 1 });
transactionSchema.index({ ppv_id: 1 });

export const TransactionModel = mongoose.model<Transaction>(
  "Transactions",
  transactionSchema,
);

