import mongoose, { type Document, Schema, type Types } from "mongoose";

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
  current_subscription_id?: Types.ObjectId;
  profiles_count: number;
  device_limit: number;
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
    current_subscription_id: {
      type: Schema.Types.ObjectId,
      ref: "Subscriptions",
    },
    profiles_count: {
      type: Number,
      default: 1,
    },
    device_limit: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "members",
  },
);

export const MemberModel = mongoose.model<Member>("Members", memberSchema);


