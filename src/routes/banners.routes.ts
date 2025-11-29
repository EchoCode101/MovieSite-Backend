import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listActiveBannersController,
  getAllBannersController,
  getBannerByIdController,
  createBannerController,
  updateBannerController,
  deleteBannerController,
} from "../modules/banners/banners.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createBannerSchema,
  updateBannerSchema,
} from "../modules/banners/banners.validators.js";

const router = Router();

// Public routes
router.get("/", listActiveBannersController);
router.get("/:id", getBannerByIdController);

// Admin routes
router.get("/admin/all", authenticateAdminToken, getAllBannersController);
router.post("/", authenticateAdminToken, validate(createBannerSchema), createBannerController);
router.put("/:id", authenticateAdminToken, validate(updateBannerSchema), updateBannerController);
router.delete("/:id", authenticateAdminToken, deleteBannerController);

export default router;

