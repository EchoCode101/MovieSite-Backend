import { SubscriptionModel } from "../models/subscription.model.js";
import { PayPerViewModel } from "../models/payPerView.model.js";
import { MemberModel } from "../models/member.model.js";
import { PlanModel } from "../models/plan.model.js";
import type { Types } from "mongoose";
import config from "../config/env.js";
import logger from "../config/logger.js";
import { findPlanBySubscriptionPlan, doesPlanNameMatchSubscriptionPlan } from "./planMapping.js";

export type ContentType = "movie" | "tvshow" | "episode";
export type AccessType = "free" | "subscription" | "pay_per_view";

/**
 * Check if user has access to content based on subscription
 */
export async function checkSubscriptionAccess(
  userId: string,
  planIds: Types.ObjectId[],
): Promise<boolean> {
  // Get user document first (we'll need it for fallback)
  const user = await MemberModel.findById(userId).select("subscription_plan");
  
  if (!user) {
    if (config.nodeEnv === "development") {
      logger.debug(`[Access Control] User not found: ${userId}`);
    }
    return false;
  }

  // If no plan restrictions, allow all subscription users
  if (!planIds || planIds.length === 0) {
    // Check if user has any active subscription
    const subscription = await SubscriptionModel.findOne({
      user_id: userId,
      status: "active",
      ends_at: { $gt: new Date() },
    });

    if (subscription) {
      if (config.nodeEnv === "development") {
        logger.debug(`[Access Control] User ${userId} has active subscription (no plan restrictions)`);
      }
      return true; // User has active subscription
    }

    // Fallback: check user's subscription_plan field
    if (user.subscription_plan && user.subscription_plan !== "Free") {
      if (config.nodeEnv === "development") {
        logger.debug(`[Access Control] User ${userId} has subscription_plan=${user.subscription_plan} (no plan restrictions)`);
      }
      return true; // User has a paid plan
    }

    if (config.nodeEnv === "development") {
      logger.debug(`[Access Control] User ${userId} denied access (no subscription, subscription_plan=${user.subscription_plan})`);
    }
    return false;
  }

  // Find active subscription for user
  const subscription = await SubscriptionModel.findOne({
    user_id: userId,
    status: "active",
    ends_at: { $gt: new Date() },
  }).populate("plan_id");

  if (subscription) {
    const userPlanId = (subscription.plan_id as any)?._id?.toString();
    const hasMatchingPlan = planIds.some((planId) => planId.toString() === userPlanId);

    // If user has matching plan, grant access
    if (hasMatchingPlan) {
      if (config.nodeEnv === "development") {
        logger.debug(`[Access Control] User ${userId} has matching plan ID: ${userPlanId}`);
      }
      return true;
    }

    // If user has active subscription but plan doesn't match, check if they have "Ultimate" plan
    // Ultimate users should have access to all subscription content
    if (user.subscription_plan === "Ultimate") {
      if (config.nodeEnv === "development") {
        logger.debug(`[Access Control] User ${userId} has Ultimate plan - granting access to all subscription content`);
      }
      return true;
    }

    if (config.nodeEnv === "development") {
      logger.debug(`[Access Control] User ${userId} denied access (plan ID ${userPlanId} not in required plans)`);
    }
    return false;
  }

  // No active subscription record - check user's subscription_plan field as fallback
  // If user has Ultimate subscription_plan, grant access to all subscription content
  if (user.subscription_plan === "Ultimate") {
    if (config.nodeEnv === "development") {
      logger.debug(`[Access Control] User ${userId} has Ultimate subscription_plan - granting access to all subscription content`);
    }
    return true;
  }

  // For other plans, try to match plan name to plan IDs using improved mapping
  if (user.subscription_plan && user.subscription_plan !== "Free") {
    // Use the plan mapping utility to find matching plan
    const userPlan = await findPlanBySubscriptionPlan(user.subscription_plan);

    if (userPlan) {
      const userPlanId = userPlan._id.toString();
      const hasMatchingPlan = planIds.some((planId) => planId.toString() === userPlanId);
      
      if (hasMatchingPlan) {
        if (config.nodeEnv === "development") {
          logger.debug(`[Access Control] User ${userId} has subscription_plan=${user.subscription_plan} matching plan ID: ${userPlanId}`);
        }
        return true;
      } else {
        if (config.nodeEnv === "development") {
          logger.debug(`[Access Control] User ${userId} has subscription_plan=${user.subscription_plan} (plan ID: ${userPlanId}) but it's not in required plans`);
        }
      }
    } else {
      if (config.nodeEnv === "development") {
        logger.debug(`[Access Control] User ${userId} has subscription_plan=${user.subscription_plan} but no matching plan found in database`);
      }
    }
  }

  if (config.nodeEnv === "development") {
    logger.debug(`[Access Control] User ${userId} denied access (subscription_plan=${user.subscription_plan})`);
  }
  return false;
}

/**
 * Check if user has access to PPV content
 */
export async function checkPPVAccess(
  userId: string,
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  const ppv = await PayPerViewModel.findOne({
    user_id: userId,
    target_type: contentType,
    target_id: contentId,
  });

  if (!ppv) {
    return false;
  }

  // For "buy" type, access is permanent
  if (ppv.purchase_type === "buy") {
    return true;
  }

  // For "rent" type, check expiration
  if (ppv.purchase_type === "rent" && ppv.expires_at) {
    return ppv.expires_at > new Date();
  }

  // If no expiration set for rent, assume valid
  return true;
}

/**
 * Check if user can access content
 */
export async function checkContentAccess(
  userId: string | undefined,
  accessType: AccessType,
  planIds: Types.ObjectId[],
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  // If access control is disabled, allow all access
  if (!config.enableAccessControl) {
    // Log in development to help debug
    if (config.nodeEnv === "development") {
      logger.debug(`[Access Control DISABLED] Allowing access to ${contentType} ${contentId} (userId: ${userId ?? "anonymous"})`);
    }
    return true;
  }

  // Free content is always accessible
  if (accessType === "free") {
    return true;
  }

  // If user is not authenticated, deny access to paid content
  if (!userId) {
    return false;
  }

  // Check subscription access
  if (accessType === "subscription") {
    return await checkSubscriptionAccess(userId, planIds);
  }

  // Check PPV access
  if (accessType === "pay_per_view") {
    return await checkPPVAccess(userId, contentType, contentId);
  }

  return false;
}

