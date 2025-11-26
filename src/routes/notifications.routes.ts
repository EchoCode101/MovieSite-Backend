import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  bulkDeleteNotifications,
} from "../modules/notifications/notifications.controller.js";
import {
  paginatedNotificationsSchema,
  bulkDeleteNotificationsSchema,
} from "../modules/notifications/notifications.validators.js";

const router = Router();

// Get paginated notifications (authenticated)
router.get(
  "/",
  authenticateToken,
  validate(paginatedNotificationsSchema, { target: "query" }),
  getNotifications,
);

// Get unread count (authenticated)
router.get("/unread", authenticateToken, getUnreadCount);
router.get("/unread-count", authenticateToken, getUnreadCount); // Alias for backward compatibility

// Mark notification as read (authenticated)
router.put("/:id/read", authenticateToken, markAsRead);

// Mark all notifications as read (authenticated)
router.put("/read-all", authenticateToken, markAllAsRead);

// Delete notification (authenticated)
router.delete("/:id", authenticateToken, deleteNotification);

// Bulk delete notifications (authenticated)
router.delete(
  "/bulk",
  authenticateToken,
  validate(bulkDeleteNotificationsSchema, { target: "body" }),
  bulkDeleteNotifications,
);

export default router;


