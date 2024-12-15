import express from "express";
import { refreshToken, validateToken } from "./tokenController.js";

const router = express.Router();

router.post("/refresh", refreshToken); // Route to refresh tokens
router.post("/validate", validateToken); // Route to refresh tokens

export default router;
