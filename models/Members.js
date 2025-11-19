import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
    },
    subscription_plan: {
      type: String,
      default: "Free",
      maxlength: 255,
    },
    role: {
      type: String,
      default: "user",
      maxlength: 255,
    },
    profile_pic: {
      type: String,
    },
    first_name: {
      type: String,
      maxlength: 255,
    },
    last_name: {
      type: String,
      maxlength: 255,
    },
    status: {
      type: String,
      default: "Active",
      maxlength: 255,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes are automatically created by unique: true in field definitions

const Members = mongoose.model("Members", memberSchema);

export default Members;
