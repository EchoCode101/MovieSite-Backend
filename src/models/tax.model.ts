import mongoose, { type Document, Schema } from "mongoose";

export interface Tax extends Document {
  name: string;
  country?: string;
  rate_percent: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taxSchema = new Schema<Tax>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
    },
    rate_percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "taxes",
  },
);

taxSchema.index({ country: 1 });
taxSchema.index({ is_active: 1 });

export const TaxModel = mongoose.model<Tax>("Tax", taxSchema);

