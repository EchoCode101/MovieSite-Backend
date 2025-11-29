import mongoose, { type Document, Schema } from "mongoose";

export interface Page extends Document {
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<Page>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "pages",
  },
);

// slug index is automatically created by unique: true
pageSchema.index({ is_active: 1 });

export const PageModel = mongoose.model<Page>("Pages", pageSchema);

