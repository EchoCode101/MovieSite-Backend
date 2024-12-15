import express from "express";
import videosController from "./videos.controller.js";

const router = express.Router();

router.get("/", videosController.getAllVideos);
router.get("/:id", videosController.getVideoById);
router.post("/", videosController.createVideo);
router.put("/:id", videosController.updateVideo);
router.delete("/:id", videosController.deleteVideo);

export default router;
