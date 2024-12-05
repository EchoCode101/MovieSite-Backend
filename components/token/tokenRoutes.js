import express from "express";
import { refreshToken } from "./tokenController.js";

const router = express.Router();

router.post("/refresh", refreshToken); // Route to refresh tokens

export default router;
