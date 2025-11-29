import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  listDevicesController,
  getDeviceByIdController,
  checkDeviceLimitController,
  registerDeviceController,
  updateDeviceController,
  deleteDeviceController,
} from "../modules/devices/devices.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createDeviceSchema,
  updateDeviceSchema,
} from "../modules/devices/devices.validators.js";

const router = Router();

// All routes require authentication
router.get("/", authenticateToken, listDevicesController);
router.get("/check-limit", authenticateToken, checkDeviceLimitController);
router.get("/:id", authenticateToken, getDeviceByIdController);
router.post("/", authenticateToken, validate(createDeviceSchema), registerDeviceController);
router.put("/:id", authenticateToken, validate(updateDeviceSchema), updateDeviceController);
router.delete("/:id", authenticateToken, deleteDeviceController);

export default router;

