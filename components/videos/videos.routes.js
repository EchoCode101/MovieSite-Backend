import express from "express";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getPaginatedVideos,
  getVideosWithLikesDislikes,
  // uploadAndSaveVideo,
  uploadVideoToCloudinary,
  addVideoToDatabase,
} from "./videos.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
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
router.delete("/:id", authenticateAdminToken, deleteVideo);
router.post("/addVideo", addVideoToDatabase);

export default router;
