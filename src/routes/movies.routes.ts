import { Router } from "express";
import { authenticateAdminToken, authenticateToken, optionalAuthenticateToken } from "../middlewares/auth.middleware.js";
import {
  getAllMoviesController,
  getMovieByIdController,
  getPaginatedMoviesController,
  getTrendingMoviesController,
  getFeaturedMoviesController,
  getComingSoonMoviesController,
  createMovieController,
  updateMovieController,
  deleteMovieController,
} from "../modules/movies/movies.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createMovieSchema,
  updateMovieSchema,
  paginatedMoviesSchema,
} from "../modules/movies/movies.validators.js";

const router = Router();

// Public routes (with optional authentication to get user context)
router.get("/paginated", optionalAuthenticateToken, validate(paginatedMoviesSchema), getPaginatedMoviesController);
router.get("/trending", optionalAuthenticateToken, getTrendingMoviesController);
router.get("/featured", optionalAuthenticateToken, getFeaturedMoviesController);
router.get("/coming-soon", optionalAuthenticateToken, getComingSoonMoviesController);
router.get("/:id", optionalAuthenticateToken, getMovieByIdController);

// Admin routes
router.get("/", authenticateAdminToken, getAllMoviesController);
router.post("/", authenticateAdminToken, validate(createMovieSchema), createMovieController);
router.put("/:id", authenticateAdminToken, validate(updateMovieSchema), updateMovieController);
router.delete("/:id", authenticateAdminToken, deleteMovieController);

export default router;

