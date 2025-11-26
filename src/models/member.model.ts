import mongoose, { type Document, Schema } from "mongoose";

export interface Member extends Document {
  username: string;
  email: string;
  password: string;
  subscription_plan: string;
  role: string;
  profile_pic?: string;
  first_name?: string;
  last_name?: string;
  status: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<Member>(
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
    collection: "members",
  },
);

export const MemberModel = mongoose.model<Member>("Members", memberSchema);


