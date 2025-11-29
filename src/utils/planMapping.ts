import { PlanModel } from "../models/plan.model.js";
import type { Types } from "mongoose";
import logger from "../config/logger.js";

/**
 * Map subscription_plan enum values to possible Plan names
 * Handles variations like "Ultimate" vs "Ultimate Plan"
 */
const SUBSCRIPTION_PLAN_TO_PLAN_NAMES: Record<string, string[]> = {
  Free: ["Free Plan", "Free"],
  Basic: ["Basic Plan", "Basic"],
  Premium: ["Premium Plan", "Premium"],
  Ultimate: ["Ultimate Plan", "Ultimate"],
};

/**
 * Find a plan by subscription_plan name
 * Tries multiple matching strategies:
 * 1. Direct match: subscription_plan === plan.name
 * 2. Partial match: plan.name.includes(subscription_plan)
 * 3. Case-insensitive match
 * 
 * @param subscriptionPlan - User's subscription_plan field (e.g., "Ultimate")
 * @returns Plan document or null
 */
export async function findPlanBySubscriptionPlan(
  subscriptionPlan: string,
): Promise<{ _id: Types.ObjectId; name: string } | null> {
  if (!subscriptionPlan || subscriptionPlan === "Free") {
    return null;
  }

  try {
    // Strategy 1: Try exact match first
    let plan = await PlanModel.findOne({
      name: subscriptionPlan,
      is_active: true,
    }).select("_id name");

    if (plan) {
      return { _id: plan._id as Types.ObjectId, name: plan.name };
    }

    // Strategy 2: Try matching with known variations
    const possibleNames = SUBSCRIPTION_PLAN_TO_PLAN_NAMES[subscriptionPlan];
    if (possibleNames) {
      for (const planName of possibleNames) {
        plan = await PlanModel.findOne({
          name: planName,
          is_active: true,
        }).select("_id name");

        if (plan) {
          return { _id: plan._id as Types.ObjectId, name: plan.name };
        }
      }
    }

    // Strategy 3: Try case-insensitive partial match
    plan = await PlanModel.findOne({
      name: { $regex: new RegExp(`^${subscriptionPlan}`, "i") },
      is_active: true,
    }).select("_id name");

    if (plan) {
      return { _id: plan._id as Types.ObjectId, name: plan.name };
    }

    // Strategy 4: Try if plan name contains subscription_plan
    plan = await PlanModel.findOne({
      name: { $regex: new RegExp(subscriptionPlan, "i") },
      is_active: true,
    }).select("_id name");

    if (plan) {
      return { _id: plan._id as Types.ObjectId, name: plan.name };
    }
  } catch (error) {
    logger.error("Error finding plan by subscription_plan:", error);
  }

  return null;
}

/**
 * Check if a plan name matches a subscription_plan value
 * 
 * @param planName - Plan name from database (e.g., "Ultimate Plan")
 * @param subscriptionPlan - User's subscription_plan field (e.g., "Ultimate")
 * @returns true if they match
 */
export function doesPlanNameMatchSubscriptionPlan(
  planName: string,
  subscriptionPlan: string,
): boolean {
  if (!planName || !subscriptionPlan) {
    return false;
  }

  // Exact match
  if (planName === subscriptionPlan) {
    return true;
  }

  // Check if plan name contains subscription_plan
  if (planName.toLowerCase().includes(subscriptionPlan.toLowerCase())) {
    return true;
  }

  // Check known variations
  const possibleNames = SUBSCRIPTION_PLAN_TO_PLAN_NAMES[subscriptionPlan];
  if (possibleNames && possibleNames.includes(planName)) {
    return true;
  }

  return false;
}

