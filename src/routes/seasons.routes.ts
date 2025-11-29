import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listSeasonsController,
  getSeasonByIdController,
  getSeasonsByTvShowController,
  createSeasonController,
  updateSeasonController,
  deleteSeasonController,
} from "../modules/seasons/seasons.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createSeasonSchema,
  updateSeasonSchema,
} from "../modules/seasons/seasons.validators.js";

const router = Router();

// Public routes
router.get("/tv-show/:tvShowId", getSeasonsByTvShowController);
router.get("/:id", getSeasonByIdController);

// Admin routes
router.get("/", authenticateAdminToken, listSeasonsController);
router.post("/", authenticateAdminToken, validate(createSeasonSchema), createSeasonController);
router.put("/:id", authenticateAdminToken, validate(updateSeasonSchema), updateSeasonController);
router.delete("/:id", authenticateAdminToken, deleteSeasonController);

export default router;

