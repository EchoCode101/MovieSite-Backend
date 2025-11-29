import mongoose, { type Document, Schema } from "mongoose";

export interface Genre extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const genreSchema = new Schema<Genre>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "genres",
  },
);

// slug index is automatically created by unique: true

export const GenreModel = mongoose.model<Genre>("Genre", genreSchema);

