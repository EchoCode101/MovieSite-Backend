import { Router } from "express";
import { authenticateToken, authenticateAdminToken, limiter } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  getPlansController,
  getPlanByIdController,
  getUserSubscriptionsController,
  getActiveSubscriptionController,
  createSubscriptionController,
  cancelSubscriptionController,
} from "../modules/subscriptions/subscriptions.controller.js";
import { subscriptionsValidators } from "../modules/subscriptions/subscriptions.validators.js";

const router = Router();

// Public/authenticated plan routes
router.get(
  "/plans",
  validate(subscriptionsValidators.getPlansQuerySchema, { target: "query" }),
  getPlansController,
);

router.get("/plans/:id", getPlanByIdController);

// User subscription routes (authenticated)
router.get("/", authenticateToken, getUserSubscriptionsController);
router.get("/active", authenticateToken, getActiveSubscriptionController);
router.post(
  "/",
  authenticateToken,
  limiter,
  validate(subscriptionsValidators.createSubscriptionSchema),
  createSubscriptionController,
);
router.post(
  "/cancel",
  authenticateToken,
  limiter,
  validate(subscriptionsValidators.cancelSubscriptionSchema),
  cancelSubscriptionController,
);

export default router;

