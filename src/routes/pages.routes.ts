import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listActivePagesController,
  getAllPagesController,
  getPageBySlugController,
  createPageController,
  updatePageController,
  deletePageController,
} from "../modules/pages/pages.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createPageSchema,
  updatePageSchema,
} from "../modules/pages/pages.validators.js";

const router = Router();

// Public routes
router.get("/", listActivePagesController);
router.get("/:slug", getPageBySlugController);

// Admin routes
router.get("/admin/all", authenticateAdminToken, getAllPagesController);
router.post("/", authenticateAdminToken, validate(createPageSchema), createPageController);
router.put("/:slug", authenticateAdminToken, validate(updatePageSchema), updatePageController);
router.delete("/:slug", authenticateAdminToken, deletePageController);

export default router;

