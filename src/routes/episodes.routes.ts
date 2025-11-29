import { Router } from "express";
import { authenticateAdminToken, optionalAuthenticateToken } from "../middlewares/auth.middleware.js";
import {
  listEpisodesController,
  getEpisodeByIdController,
  getEpisodesBySeasonController,
  getPaginatedEpisodesController,
  createEpisodeController,
  updateEpisodeController,
  deleteEpisodeController,
} from "../modules/episodes/episodes.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createEpisodeSchema,
  updateEpisodeSchema,
} from "../modules/episodes/episodes.validators.js";

const router = Router();

// Public routes (with optional authentication to get user context)
router.get("/paginated", optionalAuthenticateToken, getPaginatedEpisodesController);
router.get("/season/:seasonId", optionalAuthenticateToken, getEpisodesBySeasonController);
router.get("/:id", optionalAuthenticateToken, getEpisodeByIdController);

// Admin routes
router.get("/", authenticateAdminToken, listEpisodesController);
router.post("/", authenticateAdminToken, validate(createEpisodeSchema), createEpisodeController);
router.put("/:id", authenticateAdminToken, validate(updateEpisodeSchema), updateEpisodeController);
router.delete("/:id", authenticateAdminToken, deleteEpisodeController);

export default router;

