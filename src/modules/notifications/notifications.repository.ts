import { NotificationModel, type Notification } from "../../models/notification.model.js";
import type {
  PaginatedNotificationsParams,
  NotificationWithPopulated,
  BulkDeleteNotificationsInput,
} from "./notifications.types.js";

export class NotificationsRepository {
  /**
   * Find paginated notifications for a user
   */
  async findPaginated(
    userId: string,
    params: PaginatedNotificationsParams
  ): Promise<{
    notifications: NotificationWithPopulated[];
    total: number;
    unreadCount: number;
  }> {
    const { page = 1, limit = 20 } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const notifications = (await NotificationModel.find({ recipient_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("sender_id", "username profile_pic")
      .populate("reference_id")
      .exec()) as NotificationWithPopulated[];

    const total = await NotificationModel.countDocuments({ recipient_id: userId });
    const unreadCount = await NotificationModel.countDocuments({
      recipient_id: userId,
      is_read: false,
    });

    return { notifications, total, unreadCount };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      recipient_id: userId,
      is_read: false,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    return await NotificationModel.findOneAndUpdate(
      { _id: id, recipient_id: userId },
      { is_read: true },
      { new: true }
    ).exec();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await NotificationModel.updateMany(
      { recipient_id: userId, is_read: false },
      { is_read: true }
    ).exec();
    return { modifiedCount: result.modifiedCount || 0 };
  }

  /**
   * Delete notification by ID
   */
  async deleteById(id: string, userId: string): Promise<Notification | null> {
    return await NotificationModel.findOneAndDelete({
      _id: id,
      recipient_id: userId,
    }).exec();
  }

  /**
   * Bulk delete notifications
   */
  async bulkDelete(
    input: BulkDeleteNotificationsInput,
    userId: string
  ): Promise<{ deletedCount: number }> {
    const result = await NotificationModel.deleteMany({
      _id: { $in: input.ids },
      recipient_id: userId,
    }).exec();
    return { deletedCount: result.deletedCount || 0 };
  }
}

