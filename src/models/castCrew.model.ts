import mongoose, { type Document, Schema } from "mongoose";

export type CastCrewType = "actor" | "director" | "writer" | "crew";

export interface CastCrew extends Document {
  name: string;
  type: CastCrewType;
  bio?: string;
  image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const castCrewSchema = new Schema<CastCrew>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["actor", "director", "writer", "crew"],
      required: true,
    },
    bio: {
      type: String,
    },
    image_url: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "castcrew",
  },
);

castCrewSchema.index({ name: 1 });
castCrewSchema.index({ type: 1 });

export const CastCrewModel = mongoose.model<CastCrew>("CastCrew", castCrewSchema);

