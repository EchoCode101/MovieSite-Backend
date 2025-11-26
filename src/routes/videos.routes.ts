import { Router } from "express";

import {
  authenticateAdminToken,
  authenticateToken,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import upload from "../utils/multer.js";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  bulkDeleteVideos,
  getPaginatedVideos,
  getVideosWithLikesDislikes,
  uploadVideoToCloudinary,
  addVideoToDatabase,
} from "../modules/videos/videos.controller.js";
import {
  createVideoSchema,
  updateVideoSchema,
  paginatedVideosSchema,
  bulkDeleteVideosSchema,
} from "../modules/videos/videos.validators.js";

const router = Router();

// Get all videos (admin only)
router.get("/", authenticateAdminToken, getAllVideos);

// Upload video to Cloudinary (authenticated)
router.post(
  "/uploadVideoToCloudinary",
  authenticateToken,
  upload.single("video"),
  uploadVideoToCloudinary,
);

// Get paginated videos (public)
router.get(
  "/paginated",
  validateRequest(paginatedVideosSchema, "query"),
  getPaginatedVideos,
);

// Get videos with likes/dislikes (admin only)
router.get(
  "/likes-dislikes-with-members",
  authenticateAdminToken,
  getVideosWithLikesDislikes,
);

// Create video (admin only)
router.post(
  "/",
  authenticateAdminToken,
  validateRequest(createVideoSchema, "body"),
  createVideo,
);

// Get video by ID (public)
router.get("/:id", getVideoById);

// Update video (admin only)
router.put(
  "/:id",
  authenticateAdminToken,
  validateRequest(updateVideoSchema, "body"),
  updateVideo,
);

// Bulk delete videos (authenticated - admin or owner)
router.delete(
  "/bulk",
  authenticateToken,
  validateRequest(bulkDeleteVideosSchema, "body"),
  bulkDeleteVideos,
);

// Delete video (admin only)
router.delete("/:id", authenticateAdminToken, deleteVideo);

// Add video to database (authenticated)
router.post(
  "/addVideo",
  authenticateToken,
  validateRequest(createVideoSchema, "body"),
  addVideoToDatabase,
);

export default router;

