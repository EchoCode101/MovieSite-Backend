import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { refreshToken, validateToken } from "../modules/token/token.controller.js";

const router = Router();

// Refresh access token (public - uses refresh token from cookie)
router.post("/refresh", refreshToken);

// Validate access token (authenticated)
router.post("/validate", authenticateToken, validateToken);

export default router;


