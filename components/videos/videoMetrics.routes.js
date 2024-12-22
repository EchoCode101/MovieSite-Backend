import express from "express";
import { getVideoMetrics } from "./videoMetrics.controller.js";

const router = express.Router();

router.get("/", getVideoMetrics);

export default router;
