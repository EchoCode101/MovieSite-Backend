import { Types } from "mongoose";
import { PayPerViewModel, type PayPerView } from "../../models/payPerView.model.js";
import type { CreatePayPerViewInput } from "./payPerView.types.js";

export class PayPerViewRepository {
  async findByUserId(userId: string): Promise<PayPerView[]> {
    return PayPerViewModel.find({ user_id: userId })
      .sort({ purchased_at: -1 })
      .exec();
  }

  async findById(id: string): Promise<PayPerView | null> {
    return PayPerViewModel.findById(id).exec();
  }

  async findByTarget(
    userId: string,
    targetType: "movie" | "episode",
    targetId: string,
  ): Promise<PayPerView | null> {
    return PayPerViewModel.findOne({
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
    }).exec();
  }

  async create(input: CreatePayPerViewInput): Promise<PayPerView> {
    // Calculate expires_at if rent type
    let expiresAt: Date | undefined;
    if (input.purchase_type === "rent" && input.access_duration_hours) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + input.access_duration_hours);
    }

    const doc = await PayPerViewModel.create({
      ...input,
      user_id: new Types.ObjectId(input.user_id),
      target_id: new Types.ObjectId(input.target_id),
      currency: input.currency || "USD",
      purchase_type: input.purchase_type || "rent",
      expires_at: expiresAt,
    });
    return doc;
  }
}

