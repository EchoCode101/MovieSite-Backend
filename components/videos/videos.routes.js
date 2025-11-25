import express from "express";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  bulkDeleteVideos,
  getPaginatedVideos,
  getVideosWithLikesDislikes,
  // uploadAndSaveVideo,
  uploadVideoToCloudinary,
  addVideoToDatabase,
} from "./videos.controller.js";
import {
  authenticateAdminToken,
  authenticateToken,
} from "../auth/authMiddleware.js";
import upload from "../Utilities/multer.js";

const router = express.Router();

router.get("/", authenticateAdminToken, getAllVideos);
// Update route to use .fields() for handling multiple fields
// router.post(
//   "/upload",
//   upload, // `multer` handles multiple fields
//   uploadAndSaveVideo
// );

router.post(
  "/uploadVideoToCloudinary",
  authenticateToken,
  upload.single("video"), // Handle file upload
  uploadVideoToCloudinary
);

router.get("/paginated", getPaginatedVideos);
router.get(
  "/likes-dislikes-with-members",
  authenticateAdminToken,
  getVideosWithLikesDislikes
); // New route
router.post("/", authenticateAdminToken, createVideo);
router.get("/:id", getVideoById);
router.put("/:id", authenticateAdminToken, updateVideo);
router.delete("/bulk", authenticateToken, bulkDeleteVideos); // Bulk delete
router.delete("/:id", authenticateAdminToken, deleteVideo);
router.post("/addVideo", authenticateToken, addVideoToDatabase);

export default router;
