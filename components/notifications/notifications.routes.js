import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  bulkDeleteNotifications,
} from "./notifications.controller.js";
import { authenticateToken } from "../auth/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken); // All routes require auth

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/bulk", bulkDeleteNotifications); // Bulk delete
router.delete("/:id", deleteNotification);

export default router;
