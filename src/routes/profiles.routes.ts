import { Router } from "express";

import { authenticateToken } from "../middlewares/auth.middleware.js";

import {
  listProfilesController,
  createProfileController,
  updateProfileByIdController,
  deleteProfileByIdController,
} from "../modules/profiles/profiles.controller.js";

const router = Router();

router.get("/", authenticateToken, listProfilesController);
router.post("/", authenticateToken, createProfileController);
router.put("/:id", authenticateToken, updateProfileByIdController);
router.delete("/:id", authenticateToken, deleteProfileByIdController);

export default router;


