import express from "express";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from "./videos.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateAdminToken, getAllVideos);
router.get("/:id", getVideoById);
router.post("/", authenticateAdminToken, createVideo);
router.put("/:id", authenticateAdminToken, updateVideo);
router.delete("/:id", authenticateAdminToken, deleteVideo);

export default router;
