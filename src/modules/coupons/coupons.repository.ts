import { Types } from "mongoose";
import { CouponModel, type Coupon } from "../../models/coupon.model.js";
import type { CreateCouponInput, UpdateCouponInput } from "./coupons.types.js";

export class CouponsRepository {
  async findAll(): Promise<Coupon[]> {
    return CouponModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Coupon | null> {
    return CouponModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return CouponModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async create(input: CreateCouponInput): Promise<Coupon> {
    const doc = await CouponModel.create({
      ...input,
      code: input.code.toUpperCase(),
      applicable_plan_ids: input.applicable_plan_ids?.map((id) => new Types.ObjectId(id)) || [],
    });
    return doc;
  }

  async updateById(id: string, input: UpdateCouponInput): Promise<Coupon | null> {
    const update: any = { ...input };
    if (input.applicable_plan_ids) {
      update.applicable_plan_ids = input.applicable_plan_ids.map(
        (id) => new Types.ObjectId(id),
      );
    }

    return CouponModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Coupon | null> {
    return CouponModel.findByIdAndDelete(id).exec();
  }
}

