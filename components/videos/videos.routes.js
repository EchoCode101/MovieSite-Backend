import express from "express";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getPaginatedVideos,
  getVideosWithLikesDislikes,
} from "./videos.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateAdminToken, getAllVideos);
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

export default router;
