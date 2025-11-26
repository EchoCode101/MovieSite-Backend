import type { Types } from "mongoose";
import type { Plan, BillingCycle } from "../../models/plan.model.js";
import type { Subscription, SubscriptionStatus, PaymentStatus } from "../../models/subscription.model.js";

export interface PlanDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  billing_cycle: BillingCycle;
  max_profiles: number;
  max_devices: number;
  allow_download: boolean;
  allow_cast: boolean;
  ad_supported: boolean;
  is_featured: boolean;
  is_active: boolean;
  tax_included: boolean;
  available_for_ppv: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionDto {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at?: Date;
  ends_at?: Date;
  cancelled_at?: Date;
  base_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  coupon_id?: string;
  payment_status: PaymentStatus;
  payment_transaction_id?: string;
  is_manual: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Populated plan info (if needed)
  plan?: PlanDto;
}

export interface CreateSubscriptionInput {
  plan_id: string;
  coupon_code?: string;
}

export interface CancelSubscriptionInput {
  subscription_id: string;
}

export interface PaginatedPlansResult {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  plans: PlanDto[];
}

export function mapPlanToDto(plan: Plan): PlanDto {
  return {
    id: plan._id?.toString() ?? "",
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    price: plan.price,
    billing_cycle: plan.billing_cycle,
    max_profiles: plan.max_profiles,
    max_devices: plan.max_devices,
    allow_download: plan.allow_download,
    allow_cast: plan.allow_cast,
    ad_supported: plan.ad_supported,
    is_featured: plan.is_featured,
    is_active: plan.is_active,
    tax_included: plan.tax_included,
    available_for_ppv: plan.available_for_ppv,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export function mapSubscriptionToDto(subscription: Subscription): SubscriptionDto {
  return {
    id: subscription._id?.toString() ?? "",
    user_id: subscription.user_id.toString(),
    plan_id: subscription.plan_id.toString(),
    status: subscription.status,
    started_at: subscription.started_at,
    ends_at: subscription.ends_at,
    cancelled_at: subscription.cancelled_at,
    base_amount: subscription.base_amount,
    tax_amount: subscription.tax_amount,
    discount_amount: subscription.discount_amount,
    total_amount: subscription.total_amount,
    currency: subscription.currency,
    coupon_id: subscription.coupon_id?.toString(),
    payment_status: subscription.payment_status,
    payment_transaction_id: subscription.payment_transaction_id?.toString(),
    is_manual: subscription.is_manual,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}

