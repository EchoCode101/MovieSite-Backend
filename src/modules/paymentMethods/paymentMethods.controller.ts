import type { Request, Response, NextFunction } from "express";
import { PaymentMethodsService } from "./paymentMethods.service.js";
import logger from "../../config/logger.js";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./paymentMethods.validators.js";

const paymentMethodsService = new PaymentMethodsService();

export const listActivePaymentMethodsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const methods = await paymentMethodsService.listActivePaymentMethods();
    res.status(200).json({
      success: true,
      message: "Payment methods retrieved successfully",
      data: methods,
    });
  } catch (error) {
    logger.error("Error listing payment methods:", error);
    next(error);
  }
};

export const listAllPaymentMethodsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const methods = await paymentMethodsService.listAllPaymentMethods();
    res.status(200).json({
      success: true,
      message: "Payment methods retrieved successfully",
      data: methods,
    });
  } catch (error) {
    logger.error("Error listing all payment methods:", error);
    next(error);
  }
};

export const getPaymentMethodByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const method = await paymentMethodsService.getPaymentMethodById(req.params.id, true);
    res.status(200).json({
      success: true,
      message: "Payment method retrieved successfully",
      data: method,
    });
  } catch (error) {
    logger.error("Error getting payment method:", error);
    next(error);
  }
};

export const createPaymentMethodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createPaymentMethodSchema.validate(req.body, {
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

    const method = await paymentMethodsService.createPaymentMethod(value);
    res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data: method,
    });
  } catch (error) {
    logger.error("Error creating payment method:", error);
    next(error);
  }
};

export const updatePaymentMethodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updatePaymentMethodSchema.validate(req.body, {
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

    const method = await paymentMethodsService.updatePaymentMethod(req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: method,
    });
  } catch (error) {
    logger.error("Error updating payment method:", error);
    next(error);
  }
};

export const deletePaymentMethodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await paymentMethodsService.deletePaymentMethod(req.params.id);
    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting payment method:", error);
    next(error);
  }
};

