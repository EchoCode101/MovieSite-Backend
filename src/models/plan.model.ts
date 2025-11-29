import mongoose, { type Document, Schema, type Types } from "mongoose";

export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";

export interface Plan extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  billing_cycle: BillingCycle;
  max_profiles: number;
  max_devices: number;
  allow_download: boolean;
  allow_cast: boolean;
  ad_supported: boolean;
  is_featured: boolean;
  is_active: boolean;
  tax_included: boolean;
  available_for_ppv: boolean;
  created_by?: Types.ObjectId;
  updated_by?: Types.ObjectId;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<Plan>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    billing_cycle: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    max_profiles: { type: Number, default: 1 },
    max_devices: { type: Number, default: 1 },
    allow_download: { type: Boolean, default: false },
    allow_cast: { type: Boolean, default: false },
    ad_supported: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    tax_included: { type: Boolean, default: false },
    available_for_ppv: { type: Boolean, default: false },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "Admins",
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "Admins",
    },
    deleted_at: {
      type: Date,
    },
  },
  { timestamps: true, collection: "plans" },
);

export const PlanModel = mongoose.model<Plan>("Plan", planSchema);


