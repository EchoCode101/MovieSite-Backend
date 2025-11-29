import type { Request, Response, NextFunction } from "express";
import { CouponsService } from "./coupons.service.js";
import logger from "../../config/logger.js";
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from "./coupons.validators.js";

const couponsService = new CouponsService();

export const listCouponsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const coupons = await couponsService.listCoupons();
    res.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      data: coupons,
    });
  } catch (error) {
    logger.error("Error listing coupons:", error);
    next(error);
  }
};

export const getCouponByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const coupon = await couponsService.getCouponById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Coupon retrieved successfully",
      data: coupon,
    });
  } catch (error) {
    logger.error("Error getting coupon:", error);
    next(error);
  }
};

export const validateCouponController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = validateCouponSchema.validate({ code: req.params.code, plan_id: req.query.plan_id }, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const result = await couponsService.validateCoupon(value.code, value.plan_id || "", userId);

    res.status(200).json({
      success: result.valid,
      message: result.message || "Coupon is valid",
      data: result,
    });
  } catch (error) {
    logger.error("Error validating coupon:", error);
    next(error);
  }
};

export const createCouponController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createCouponSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const coupon = await couponsService.createCoupon(value);
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    logger.error("Error creating coupon:", error);
    next(error);
  }
};

export const updateCouponController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateCouponSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const coupon = await couponsService.updateCoupon(req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    logger.error("Error updating coupon:", error);
    next(error);
  }
};

export const deleteCouponController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await couponsService.deleteCoupon(req.params.id);
    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting coupon:", error);
    next(error);
  }
};

