import mongoose, { type Document, Schema } from "mongoose";

export interface Tag extends Document {
  tag_name: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<Tag>(
  {
    tag_name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    collection: "tags",
  },
);

// Index is automatically created by unique: true in field definition

export const TagModel = mongoose.model<Tag>("Tags", tagSchema);

