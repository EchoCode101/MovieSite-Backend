import type { Notification } from "../../models/notification.model.js";
import type { Types } from "mongoose";

/**
 * Notification with populated sender and reference
 */
export interface NotificationWithPopulated extends Omit<Notification, "sender_id" | "reference_id"> {
  sender_id: {
    _id: Types.ObjectId;
    username?: string;
    profile_pic?: string;
  };
  reference_id?: unknown;
}

/**
 * Pagination query parameters
 */
export interface PaginatedNotificationsParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated notifications response
 */
export interface PaginatedNotificationsResponse {
  notifications: NotificationWithPopulated[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  unreadCount: number;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Bulk delete input
 */
export interface BulkDeleteNotificationsInput {
  ids: string[];
}

