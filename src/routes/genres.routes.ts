import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listGenresController,
  getGenreByIdController,
  createGenreController,
  updateGenreController,
  deleteGenreController,
} from "../modules/genres/genres.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createGenreSchema,
  updateGenreSchema,
} from "../modules/genres/genres.validators.js";

const router = Router();

// Public routes
router.get("/", listGenresController);
router.get("/:id", getGenreByIdController);

// Admin routes
router.post("/", authenticateAdminToken, validate(createGenreSchema), createGenreController);
router.put("/:id", authenticateAdminToken, validate(updateGenreSchema), updateGenreController);
router.delete("/:id", authenticateAdminToken, deleteGenreController);

export default router;

