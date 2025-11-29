import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  listCouponsController,
  getCouponByIdController,
  validateCouponController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
} from "../modules/coupons/coupons.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../modules/coupons/coupons.validators.js";

const router = Router();

// Public route (must come before /:id to avoid conflict)
router.get("/validate/:code", validate(validateCouponSchema), validateCouponController);

// Admin routes
router.get("/", authenticateAdminToken, listCouponsController);
router.get("/:id", authenticateAdminToken, getCouponByIdController);
router.post("/", authenticateAdminToken, validate(createCouponSchema), createCouponController);
router.put("/:id", authenticateAdminToken, validate(updateCouponSchema), updateCouponController);
router.delete("/:id", authenticateAdminToken, deleteCouponController);

export default router;

