import createError from "http-errors";
import { CouponsRepository } from "./coupons.repository.js";
import type {
  CreateCouponInput,
  CouponDto,
  UpdateCouponInput,
  ValidateCouponResult,
} from "./coupons.types.js";
import { mapCouponToDto } from "./coupons.types.js";
import { SubscriptionModel } from "../../models/subscription.model.js";

export class CouponsService {
  private repo: CouponsRepository;

  constructor(repo = new CouponsRepository()) {
    this.repo = repo;
  }

  async listCoupons(): Promise<CouponDto[]> {
    const coupons = await this.repo.findAll();
    return coupons.map(mapCouponToDto);
  }

  async getCouponById(id: string): Promise<CouponDto> {
    const coupon = await this.repo.findById(id);
    if (!coupon) {
      throw createError(404, "Coupon not found");
    }
    return mapCouponToDto(coupon);
  }

  async validateCoupon(
    code: string,
    planId: string,
    userId?: string,
  ): Promise<ValidateCouponResult> {
    const coupon = await this.repo.findByCode(code);
    if (!coupon) {
      return {
        valid: false,
        message: "Coupon not found",
      };
    }

    if (!coupon.is_active) {
      return {
        valid: false,
        message: "Coupon is not active",
      };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && coupon.valid_from > now) {
      return {
        valid: false,
        message: "Coupon is not yet valid",
      };
    }

    if (coupon.valid_until && coupon.valid_until < now) {
      return {
        valid: false,
        message: "Coupon has expired",
      };
    }

    // Check if applicable to plan
    if (
      coupon.applicable_plan_ids.length > 0 &&
      !coupon.applicable_plan_ids.some((id) => id.toString() === planId)
    ) {
      return {
        valid: false,
        message: "Coupon is not applicable to this plan",
      };
    }

    // TODO: Check max_uses and max_uses_per_user if userId provided
    // This would require a UserCouponRedeem collection

    return {
      valid: true,
      coupon: mapCouponToDto(coupon),
    };
  }

  async calculateDiscount(
    coupon: CouponDto,
    baseAmount: number,
  ): Promise<number> {
    if (coupon.discount_type === "fixed") {
      return Math.min(coupon.discount_value, baseAmount);
    } else {
      // percent
      return (baseAmount * coupon.discount_value) / 100;
    }
  }

  async createCoupon(input: CreateCouponInput): Promise<CouponDto> {
    // Check if code already exists
    const existing = await this.repo.findByCode(input.code);
    if (existing) {
      throw createError(409, "Coupon with this code already exists");
    }

    const coupon = await this.repo.create(input);
    return mapCouponToDto(coupon);
  }

  async updateCoupon(id: string, input: UpdateCouponInput): Promise<CouponDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Coupon not found");
    }

    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw createError(404, "Coupon not found");
    }
    return mapCouponToDto(updated);
  }

  async deleteCoupon(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Coupon not found");
    }
    await this.repo.deleteById(id);
  }
}

