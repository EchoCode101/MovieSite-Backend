import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getUserPurchasesController,
  getPurchaseByIdController,
  purchaseContentController,
  checkAccessController,
} from "../modules/payPerView/payPerView.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  purchasePayPerViewSchema,
  checkAccessSchema,
} from "../modules/payPerView/payPerView.validators.js";

const router = Router();

// All routes require authentication
router.get("/", authenticateToken, getUserPurchasesController);
// Check access route must come before /:id to avoid route conflicts
router.get("/check-access/:targetType/:targetId", authenticateToken, validate(checkAccessSchema, "params"), checkAccessController);
router.post("/purchase", authenticateToken, validate(purchasePayPerViewSchema), purchaseContentController);
router.get("/:id", authenticateToken, getPurchaseByIdController);

export default router;

