import type { Request, Response, NextFunction } from "express";
import { SubscriptionsService } from "./subscriptions.service.js";
import logger from "../../config/logger.js";

const subscriptionsService = new SubscriptionsService();

export const getPlansController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const isActive = req.query.is_active === "true" ? true : req.query.is_active === "false" ? false : undefined;
    const isFeatured =
      req.query.is_featured === "true" ? true : req.query.is_featured === "false" ? false : undefined;
    const billingCycle = req.query.billing_cycle as string | undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await subscriptionsService.getPlans({
      isActive,
      isFeatured,
      billingCycle,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Plans retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching plans (TS controller):", error);
    next(error);
  }
};

export const getPlanByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const plan = await subscriptionsService.getPlanById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Plan retrieved successfully",
      data: plan,
    });
  } catch (error) {
    logger.error("Error fetching plan (TS controller):", error);
    next(error);
  }
};

export const getUserSubscriptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const subscriptions = await subscriptionsService.getUserSubscriptions(userId);
    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
    });
  } catch (error) {
    logger.error("Error fetching user subscriptions (TS controller):", error);
    next(error);
  }
};

export const getActiveSubscriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const subscription = await subscriptionsService.getActiveSubscription(userId);
    res.status(200).json({
      success: true,
      message: subscription ? "Active subscription retrieved successfully" : "No active subscription found",
      data: subscription,
    });
  } catch (error) {
    logger.error("Error fetching active subscription (TS controller):", error);
    next(error);
  }
};

export const createSubscriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const subscription = await subscriptionsService.createSubscription(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    logger.error("Error creating subscription (TS controller):", error);
    next(error);
  }
};

export const cancelSubscriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const subscription = await subscriptionsService.cancelSubscription(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    logger.error("Error cancelling subscription (TS controller):", error);
    next(error);
  }
};

