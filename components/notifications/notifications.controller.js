import { Notifications } from "../../models/index.js";
import createError from "http-errors";
import logger from "../Utilities/logger.js";

// Get all notifications for the logged-in user
export const getNotifications = async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const recipient_id = req.user.id;

  try {
    const notifications = await Notifications.find({ recipient_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("sender_id", "username profile_pic")
      .populate("reference_id"); // Populate the referenced item (Video, Comment, etc.)

    const total = await Notifications.countDocuments({ recipient_id });
    const unreadCount = await Notifications.countDocuments({
      recipient_id,
      is_read: false,
    });

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount,
      },
    });
  } catch (error) {
    logger.error("Error fetching notifications:", error);
    next(createError(500, error.message));
  }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
  const recipient_id = req.user.id;
  try {
    const count = await Notifications.countDocuments({
      recipient_id,
      is_read: false,
    });
    res.status(200).json({
      success: true,
      message: "Unread count retrieved",
      data: { count },
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Mark a notification as read
export const markAsRead = async (req, res, next) => {
  const { id } = req.params;
  const recipient_id = req.user.id;

  try {
    const notification = await Notifications.findOneAndUpdate(
      { _id: id, recipient_id },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Mark all as read
export const markAllAsRead = async (req, res, next) => {
  const recipient_id = req.user.id;

  try {
    await Notifications.updateMany(
      { recipient_id, is_read: false },
      { is_read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  const { id } = req.params;
  const recipient_id = req.user.id;

  try {
    const notification = await Notifications.findOneAndDelete({
      _id: id,
      recipient_id,
    });

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Bulk delete notifications
export const bulkDeleteNotifications = async (req, res, next) => {
  const { ids } = req.body;
  const recipient_id = req.user.id;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(createError(400, "ids array is required"));
  }

  try {
    // Only delete notifications belonging to the recipient
    const result = await Notifications.deleteMany({
      _id: { $in: ids },
      recipient_id,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted successfully`,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};
