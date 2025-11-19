import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
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
  }
);

// Index is automatically created by unique: true in field definition

const Tags = mongoose.model("Tags", tagSchema);

export default Tags;
