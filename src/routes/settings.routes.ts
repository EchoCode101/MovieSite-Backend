import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listAllSettingsController,
  getSettingByKeyController,
  getSettingsByGroupController,
  createOrUpdateSettingController,
  updateSettingController,
  deleteSettingController,
} from "../modules/settings/settings.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createSettingSchema,
  updateSettingSchema,
} from "../modules/settings/settings.validators.js";

const router = Router();

// All routes require admin
router.get("/", authenticateAdminToken, listAllSettingsController);
router.get("/group/:group", authenticateAdminToken, getSettingsByGroupController);
router.get("/:key", authenticateAdminToken, getSettingByKeyController);
router.post("/", authenticateAdminToken, validate(createSettingSchema), createOrUpdateSettingController);
router.put("/:key", authenticateAdminToken, validate(updateSettingSchema), updateSettingController);
router.delete("/:key", authenticateAdminToken, deleteSettingController);

export default router;

