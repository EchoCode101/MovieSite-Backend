import type { Coupon } from "../../models/coupon.model.js";

export interface CouponDto {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  max_uses?: number;
  max_uses_per_user?: number;
  valid_from?: Date;
  valid_until?: Date;
  applicable_plan_ids: string[];
  is_active: boolean;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  max_uses?: number;
  max_uses_per_user?: number;
  valid_from?: Date;
  valid_until?: Date;
  applicable_plan_ids?: string[];
  is_active?: boolean;
}

export interface UpdateCouponInput {
  description?: string;
  discount_type?: "fixed" | "percent";
  discount_value?: number;
  max_uses?: number;
  max_uses_per_user?: number;
  valid_from?: Date;
  valid_until?: Date;
  applicable_plan_ids?: string[];
  is_active?: boolean;
}

export interface ValidateCouponResult {
  valid: boolean;
  coupon?: CouponDto;
  discount_amount?: number;
  message?: string;
}

export function mapCouponToDto(coupon: Coupon): CouponDto {
  return {
    id: (coupon._id as any)?.toString?.() ?? "",
    code: coupon.code,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    max_uses: coupon.max_uses,
    max_uses_per_user: coupon.max_uses_per_user,
    valid_from: coupon.valid_from,
    valid_until: coupon.valid_until,
    applicable_plan_ids: coupon.applicable_plan_ids.map((id) => id.toString()),
    is_active: coupon.is_active,
  };
}

