import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { NotificationsService } from "./notifications.service.js";
import logger from "../../config/logger.js";
import type {
  PaginatedNotificationsParams,
  BulkDeleteNotificationsInput,
} from "./notifications.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const notificationsService = new NotificationsService();

/**
 * Get paginated notifications (authenticated)
 */
export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const params: PaginatedNotificationsParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await notificationsService.getNotifications(userId, params);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: "Notifications retrieved successfully",
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Error fetching notifications:", error);
    next(createError(500, err.message || "Failed to fetch notifications"));
  }
}

/**
 * Get unread count (authenticated)
 */
export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const result = await notificationsService.getUnreadCount(userId);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: "Unread count retrieved",
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    next(createError(500, err.message || "Failed to get unread count"));
  }
}

/**
 * Mark notification as read (authenticated)
 */
export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const notification = await notificationsService.markAsRead(
      req.params.id,
      userId
    );
    const response: ApiResponse<typeof notification> = {
      success: true,
      message: "Notification marked as read",
      data: notification,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to mark notification as read")
    );
  }
}

/**
 * Mark all notifications as read (authenticated)
 */
export async function markAllAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    await notificationsService.markAllAsRead(userId);
    const response: ApiResponse = {
      success: true,
      message: "All notifications marked as read",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    next(createError(500, err.message || "Failed to mark all as read"));
  }
}

/**
 * Delete notification (authenticated)
 */
export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    await notificationsService.deleteNotification(req.params.id, userId);
    const response: ApiResponse = {
      success: true,
      message: "Notification deleted",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to delete notification")
    );
  }
}

/**
 * Bulk delete notifications (authenticated)
 */
export async function bulkDeleteNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const result = await notificationsService.bulkDeleteNotifications(
      req.body as BulkDeleteNotificationsInput,
      userId
    );
    const response: ApiResponse<typeof result> = {
      success: true,
      message: `${result.deletedCount} notifications deleted successfully`,
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to delete notifications")
    );
  }
}

