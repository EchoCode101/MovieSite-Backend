import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      maxlength: 255,
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
    first_name: {
      type: String,
      maxlength: 255,
    },
    last_name: {
      type: String,
      maxlength: 255,
    },
    role: {
      type: String,
      default: "admin",
      maxlength: 50,
    },
    status: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index is automatically created by unique: true in field definition

const Admins = mongoose.model("Admins", adminSchema);

export default Admins;
