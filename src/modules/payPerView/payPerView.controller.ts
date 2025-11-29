import type { Request, Response, NextFunction } from "express";
import { PayPerViewService } from "./payPerView.service.js";
import logger from "../../config/logger.js";
import { purchasePayPerViewSchema, checkAccessSchema } from "./payPerView.validators.js";

const payPerViewService = new PayPerViewService();

export const getUserPurchasesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const purchases = await payPerViewService.getUserPurchases(userId);
    res.status(200).json({
      success: true,
      message: "Purchases retrieved successfully",
      data: purchases,
    });
  } catch (error) {
    logger.error("Error getting user purchases:", error);
    next(error);
  }
};

export const getPurchaseByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const purchase = await payPerViewService.getPurchaseById(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "Purchase retrieved successfully",
      data: purchase,
    });
  } catch (error) {
    logger.error("Error getting purchase:", error);
    next(error);
  }
};

export const purchaseContentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = purchasePayPerViewSchema.validate(req.body, {
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
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const purchase = await payPerViewService.purchaseContent({
      ...value,
      user_id: userId,
    });
    res.status(201).json({
      success: true,
      message: "Content purchased successfully",
      data: purchase,
    });
  } catch (error) {
    logger.error("Error purchasing content:", error);
    next(error);
  }
};

export const checkAccessController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = checkAccessSchema.validate(req.params, {
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
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const result = await payPerViewService.checkAccess(
      userId,
      value.targetType as "movie" | "episode",
      value.targetId,
    );
    res.status(200).json({
      success: true,
      message: result.message || "Access check completed",
      data: result,
    });
  } catch (error) {
    logger.error("Error checking access:", error);
    next(error);
  }
};

