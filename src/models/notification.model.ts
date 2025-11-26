import mongoose, { type Document, Schema, type Types } from "mongoose";

export type NotificationType = "like" | "comment" | "reply" | "review" | "system";
export type NotificationReferenceType = "Videos" | "Comments" | "ReviewsAndRatings";

export interface Notification extends Document {
  recipient_id: Types.ObjectId;
  sender_id: Types.ObjectId;
  type: NotificationType;
  reference_id: Types.ObjectId;
  reference_type: NotificationReferenceType;
  message: string;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationsSchema = new Schema<Notification>(
  {
    recipient_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "reply", "review", "system"],
      required: true,
    },
    reference_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "reference_type",
    },
    reference_type: {
      type: String,
      required: true,
      enum: ["Videos", "Comments", "ReviewsAndRatings"],
    },
    message: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: "notifications" },
);

export const NotificationModel = mongoose.model<Notification>("Notifications", notificationsSchema);


