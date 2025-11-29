import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listCastCrewController,
  getCastCrewByIdController,
  createCastCrewController,
  updateCastCrewController,
  deleteCastCrewController,
} from "../modules/castCrew/castCrew.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createCastCrewSchema,
  updateCastCrewSchema,
} from "../modules/castCrew/castCrew.validators.js";

const router = Router();

// Public routes
router.get("/", listCastCrewController);
router.get("/:id", getCastCrewByIdController);

// Admin routes
router.post("/", authenticateAdminToken, validate(createCastCrewSchema), createCastCrewController);
router.put("/:id", authenticateAdminToken, validate(updateCastCrewSchema), updateCastCrewController);
router.delete("/:id", authenticateAdminToken, deleteCastCrewController);

export default router;

