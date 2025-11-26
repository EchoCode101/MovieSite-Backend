import { Router } from "express";
import { getVideoMetrics } from "../modules/videoMetrics/videoMetrics.controller.js";

const router = Router();

// Get all video metrics (public)
router.get("/", getVideoMetrics);

export default router;


