import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listTaxesController,
  getTaxByIdController,
  getTaxByCountryController,
  createTaxController,
  updateTaxController,
  deleteTaxController,
} from "../modules/taxes/taxes.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createTaxSchema,
  updateTaxSchema,
} from "../modules/taxes/taxes.validators.js";

const router = Router();

// Public route
router.get("/country/:country", getTaxByCountryController);

// Admin routes
router.get("/", authenticateAdminToken, listTaxesController);
router.get("/:id", authenticateAdminToken, getTaxByIdController);
router.post("/", authenticateAdminToken, validate(createTaxSchema), createTaxController);
router.put("/:id", authenticateAdminToken, validate(updateTaxSchema), updateTaxController);
router.delete("/:id", authenticateAdminToken, deleteTaxController);

export default router;

