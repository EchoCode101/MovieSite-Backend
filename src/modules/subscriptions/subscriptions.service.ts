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
    const subscription = await this.subscriptionsRepository.findActiveSubscriptionByUserId(userId);
    return subscription ? mapSubscriptionToDto(subscription) : null;
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

