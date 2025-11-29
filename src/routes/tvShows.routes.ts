import { Router } from "express";
import { authenticateAdminToken, optionalAuthenticateToken } from "../middlewares/auth.middleware.js";
import {
  getAllTvShowsController,
  getTvShowByIdController,
  getPaginatedTvShowsController,
  getTvShowSeasonsController,
  createTvShowController,
  updateTvShowController,
  deleteTvShowController,
} from "../modules/tvShows/tvShows.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createTvShowSchema,
  updateTvShowSchema,
  paginatedTvShowsSchema,
} from "../modules/tvShows/tvShows.validators.js";

const router = Router();

// Public routes (with optional authentication to get user context)
router.get("/paginated", optionalAuthenticateToken, validate(paginatedTvShowsSchema), getPaginatedTvShowsController);
router.get("/:id/seasons", optionalAuthenticateToken, getTvShowSeasonsController);
router.get("/:id", optionalAuthenticateToken, getTvShowByIdController);

// Admin routes
router.get("/", authenticateAdminToken, getAllTvShowsController);
router.post("/", authenticateAdminToken, validate(createTvShowSchema), createTvShowController);
router.put("/:id", authenticateAdminToken, validate(updateTvShowSchema), updateTvShowController);
router.delete("/:id", authenticateAdminToken, deleteTvShowController);

export default router;

