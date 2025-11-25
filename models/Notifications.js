import mongoose from "mongoose";

const NotificationsSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "reply", "review", "system"],
      required: true,
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
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
  { timestamps: true }
);

const Notifications = mongoose.model("Notifications", NotificationsSchema);

export default Notifications;
