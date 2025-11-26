import createError from "http-errors";
import { NotificationsRepository } from "./notifications.repository.js";
import type {
  PaginatedNotificationsParams,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  BulkDeleteNotificationsInput,
} from "./notifications.types.js";
import type { Notification } from "../../models/notification.model.js";

export class NotificationsService {
  private repository: NotificationsRepository;

  constructor(repository = new NotificationsRepository()) {
    this.repository = repository;
  }

  /**
   * Get paginated notifications for a user
   */
  async getNotifications(
    userId: string,
    params: PaginatedNotificationsParams
  ): Promise<PaginatedNotificationsResponse> {
    const { page = 1, limit = 20 } = params;
    const { notifications, total, unreadCount } = await this.repository.findPaginated(
      userId,
      params
    );

    return {
      notifications,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalNotifications: total,
      unreadCount,
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    const count = await this.repository.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repository.markAsRead(id, userId);
    if (!notification) {
      throw createError(404, "Notification not found");
    }
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.repository.deleteById(id, userId);
    if (!notification) {
      throw createError(404, "Notification not found");
    }
  }

  /**
   * Bulk delete notifications
   */
  async bulkDeleteNotifications(
    input: BulkDeleteNotificationsInput,
    userId: string
  ): Promise<{ deletedCount: number }> {
    return await this.repository.bulkDelete(input, userId);
  }
}

