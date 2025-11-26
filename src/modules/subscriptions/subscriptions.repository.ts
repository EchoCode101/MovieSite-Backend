import { PlanModel, type Plan } from "../../models/plan.model.js";
import { SubscriptionModel, type Subscription } from "../../models/subscription.model.js";
import { Types } from "mongoose";
import createError from "http-errors";

export class SubscriptionsRepository {
  // Plan operations
  async findPlanById(planId: string): Promise<Plan | null> {
    return PlanModel.findById(planId).exec();
  }

  async findActivePlans(filters: {
    isActive?: boolean;
    isFeatured?: boolean;
    billingCycle?: string;
    page?: number;
    limit?: number;
  }): Promise<{ plans: Plan[]; total: number }> {
    const { isActive, isFeatured, billingCycle, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (isActive !== undefined) {
      query.is_active = isActive;
    }

    if (isFeatured !== undefined) {
      query.is_featured = isFeatured;
    }

    if (billingCycle) {
      query.billing_cycle = billingCycle;
    }

    const [plans, total] = await Promise.all([
      PlanModel.find(query).sort({ price: 1 }).skip(skip).limit(limit).exec(),
      PlanModel.countDocuments(query).exec(),
    ]);

    return { plans, total };
  }

  // Subscription operations
  async findActiveSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    return SubscriptionModel.findOne({
      user_id: new Types.ObjectId(userId),
      status: "active",
    })
      .populate("plan_id")
      .exec();
  }

  async findSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    return SubscriptionModel.findById(subscriptionId).populate("plan_id").exec();
  }

  async findSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return SubscriptionModel.find({
      user_id: new Types.ObjectId(userId),
    })
      .populate("plan_id")
      .sort({ createdAt: -1 })
      .exec();
  }

  async createSubscription(
    userId: string,
    planId: string,
    amounts: {
      baseAmount: number;
      taxAmount: number;
      discountAmount: number;
      totalAmount: number;
    },
    options?: {
      couponId?: string;
      startedAt?: Date;
      endsAt?: Date;
    },
  ): Promise<Subscription> {
    return SubscriptionModel.create({
      user_id: new Types.ObjectId(userId),
      plan_id: new Types.ObjectId(planId),
      status: "pending",
      base_amount: amounts.baseAmount,
      tax_amount: amounts.taxAmount,
      discount_amount: amounts.discountAmount,
      total_amount: amounts.totalAmount,
      currency: "USD",
      coupon_id: options?.couponId ? new Types.ObjectId(options.couponId) : undefined,
      started_at: options?.startedAt,
      ends_at: options?.endsAt,
      payment_status: "pending",
    });
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: "pending" | "active" | "cancelled" | "expired",
    updates?: {
      startedAt?: Date;
      endsAt?: Date;
      cancelledAt?: Date;
      paymentStatus?: "pending" | "paid" | "failed" | "refunded";
    },
  ): Promise<Subscription | null> {
    const updateData: Record<string, unknown> = { status };

    if (updates?.startedAt) updateData.started_at = updates.startedAt;
    if (updates?.endsAt) updateData.ends_at = updates.endsAt;
    if (updates?.cancelledAt) updateData.cancelled_at = updates.cancelledAt;
    if (updates?.paymentStatus) updateData.payment_status = updates.paymentStatus;

    return SubscriptionModel.findByIdAndUpdate(subscriptionId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("plan_id")
      .exec();
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.updateSubscriptionStatus(subscriptionId, "cancelled", {
      cancelledAt: new Date(),
    });
  }
}

