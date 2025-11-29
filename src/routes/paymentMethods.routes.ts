import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listActivePaymentMethodsController,
  listAllPaymentMethodsController,
  getPaymentMethodByIdController,
  createPaymentMethodController,
  updatePaymentMethodController,
  deletePaymentMethodController,
} from "../modules/paymentMethods/paymentMethods.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "../modules/paymentMethods/paymentMethods.validators.js";

const router = Router();

// Public route (no config)
router.get("/", listActivePaymentMethodsController);

// Admin routes (with config)
router.get("/admin/all", authenticateAdminToken, listAllPaymentMethodsController);
router.get("/:id", authenticateAdminToken, getPaymentMethodByIdController);
router.post("/", authenticateAdminToken, validate(createPaymentMethodSchema), createPaymentMethodController);
router.put("/:id", authenticateAdminToken, validate(updatePaymentMethodSchema), updatePaymentMethodController);
router.delete("/:id", authenticateAdminToken, deletePaymentMethodController);

export default router;

