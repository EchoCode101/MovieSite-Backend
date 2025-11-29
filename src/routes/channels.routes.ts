import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listActiveChannelsController,
  getAllChannelsController,
  getChannelByIdController,
  createChannelController,
  updateChannelController,
  deleteChannelController,
} from "../modules/channels/channels.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createChannelSchema,
  updateChannelSchema,
} from "../modules/channels/channels.validators.js";

const router = Router();

// Public routes
router.get("/", listActiveChannelsController);
router.get("/:id", getChannelByIdController);

// Admin routes (must come after public routes, or use different paths)
router.post("/", authenticateAdminToken, validate(createChannelSchema), createChannelController);
router.put("/:id", authenticateAdminToken, validate(updateChannelSchema), updateChannelController);
router.delete("/:id", authenticateAdminToken, deleteChannelController);

// Admin route for all channels (use query param or separate endpoint)
// Note: Admin can use the public GET / endpoint, or we can add GET /admin/all

export default router;

