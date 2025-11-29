import { SubscriptionsRepository } from "./subscriptions.repository.js";
import type {
  CancelSubscriptionInput,
  CreateSubscriptionInput,
  PaginatedPlansResult,
  PlanDto,
  SubscriptionDto,
} from "./subscriptions.types.js";
import { mapPlanToDto, mapSubscriptionToDto } from "./subscriptions.types.js";
import createError from "http-errors";
import { MemberModel } from "../../models/member.model.js";
import { findPlanBySubscriptionPlan } from "../../utils/planMapping.js";

export class SubscriptionsService {
  private subscriptionsRepository: SubscriptionsRepository;

  constructor(subscriptionsRepository = new SubscriptionsRepository()) {
    this.subscriptionsRepository = subscriptionsRepository;
  }

  async getPlans(filters: {
    isActive?: boolean;
    isFeatured?: boolean;
    billingCycle?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedPlansResult> {
    const { plans, total } = await this.subscriptionsRepository.findActivePlans(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      plans: plans.map(mapPlanToDto),
    };
  }

  async getPlanById(planId: string): Promise<PlanDto> {
    const plan = await this.subscriptionsRepository.findPlanById(planId);
    if (!plan) {
      throw createError(404, "Plan not found");
    }
    return mapPlanToDto(plan);
  }

  async getUserSubscriptions(userId: string): Promise<SubscriptionDto[]> {
    const subscriptions = await this.subscriptionsRepository.findSubscriptionsByUserId(userId);
    return subscriptions.map(mapSubscriptionToDto);
  }

  async getActiveSubscription(userId: string): Promise<SubscriptionDto | null> {
    // First, try to find an active subscription record
    const subscription = await this.subscriptionsRepository.findActiveSubscriptionByUserId(userId);
    if (subscription) {
      const dto = mapSubscriptionToDto(subscription);
      // Populate plan info if available
      if (subscription.plan_id && typeof subscription.plan_id === "object") {
        dto.plan = mapPlanToDto(subscription.plan_id as any);
      }
      return dto;
    }

    // Fallback: Check user's subscription_plan field
    // This handles cases where user has subscription_plan set but no subscription record
    const user = await MemberModel.findById(userId).select("subscription_plan");
    if (user && user.subscription_plan && user.subscription_plan !== "Free") {
      // Find matching plan in database
      const plan = await findPlanBySubscriptionPlan(user.subscription_plan);
      if (plan) {
        // Return synthetic subscription object
        // This allows frontend to work with subscription_plan field
        const syntheticSubscription: SubscriptionDto = {
          id: "", // No subscription ID since it's synthetic
          user_id: userId,
          plan_id: plan._id.toString(),
          status: "active", // Treat as active
          started_at: new Date(), // Use current date
          ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          base_amount: 0,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: 0,
          currency: "USD",
          payment_status: "paid",
          is_manual: true, // Mark as manual since it's based on subscription_plan field
          createdAt: new Date(),
          updatedAt: new Date(),
          plan: {
            id: plan._id.toString(),
            name: plan.name,
            slug: "", // Will be populated if needed
            price: 0,
            billing_cycle: "monthly",
            max_profiles: 1,
            max_devices: 1,
            allow_download: false,
            allow_cast: false,
            ad_supported: false,
            is_featured: false,
            is_active: true,
            tax_included: false,
            available_for_ppv: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

        // Try to get full plan details
        const fullPlan = await this.subscriptionsRepository.findPlanById(plan._id.toString());
        if (fullPlan) {
          syntheticSubscription.plan = mapPlanToDto(fullPlan);
        }

        return syntheticSubscription;
      }
    }

    return null;
  }

  async createSubscription(userId: string, input: CreateSubscriptionInput): Promise<SubscriptionDto> {
    // Check if user already has an active subscription
    const existingActive = await this.subscriptionsRepository.findActiveSubscriptionByUserId(userId);
    if (existingActive) {
      throw createError(409, "User already has an active subscription");
    }

    // Find the plan
    const plan = await this.subscriptionsRepository.findPlanById(input.plan_id);
    if (!plan) {
      throw createError(404, "Plan not found");
    }

    if (!plan.is_active) {
      throw createError(400, "Plan is not active");
    }

    // Calculate amounts (simplified - in production, apply coupon logic, tax calculation, etc.)
    const baseAmount = plan.price;
    const taxAmount = plan.tax_included ? 0 : baseAmount * 0.1; // 10% tax example
    const discountAmount = 0; // TODO: Apply coupon if provided
    const totalAmount = baseAmount + taxAmount - discountAmount;

    // Calculate subscription end date based on billing cycle
    const startedAt = new Date();
    let endsAt: Date;
    switch (plan.billing_cycle) {
      case "weekly":
        endsAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        endsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarterly":
        endsAt = new Date(startedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      case "yearly":
        endsAt = new Date(startedAt.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        endsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const subscription = await this.subscriptionsRepository.createSubscription(
      userId,
      input.plan_id,
      {
        baseAmount,
        taxAmount,
        discountAmount,
        totalAmount,
      },
      {
        startedAt,
        endsAt,
        // couponId: input.coupon_code ? ... : undefined, // TODO: Resolve coupon
      },
    );

    return mapSubscriptionToDto(subscription);
  }

  async cancelSubscription(userId: string, input: CancelSubscriptionInput): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionsRepository.findSubscriptionById(input.subscription_id);

    if (!subscription) {
      throw createError(404, "Subscription not found");
    }

    // Verify ownership
    if (subscription.user_id.toString() !== userId) {
      throw createError(403, "You are not authorized to cancel this subscription");
    }

    if (subscription.status === "cancelled") {
      throw createError(400, "Subscription is already cancelled");
    }

    const cancelled = await this.subscriptionsRepository.cancelSubscription(input.subscription_id);
    if (!cancelled) {
      throw createError(500, "Failed to cancel subscription");
    }

    return mapSubscriptionToDto(cancelled);
  }
}

