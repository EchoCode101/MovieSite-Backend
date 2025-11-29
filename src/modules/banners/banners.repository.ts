import { Types } from "mongoose";
import { BannerModel, type Banner } from "../../models/banner.model.js";
import type { CreateBannerInput, UpdateBannerInput, BannerFilters } from "./banners.types.js";

export class BannersRepository {
  async findActive(filters?: BannerFilters): Promise<Banner[]> {
    const query: any = { is_active: true };

    if (filters?.device) {
      query.device = filters.device;
    }

    if (filters?.position) {
      query.position = filters.position;
    }

    return BannerModel.find(query)
      .sort({ sort_order: 1, createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<Banner[]> {
    return BannerModel.find().sort({ sort_order: 1, createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Banner | null> {
    return BannerModel.findById(id).exec();
  }

  async create(input: CreateBannerInput, userId: string): Promise<Banner> {
    const doc = await BannerModel.create({
      ...input,
      target_id: new Types.ObjectId(input.target_id),
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateBannerInput, userId?: string): Promise<Banner | null> {
    const update: any = { ...input };
    if (userId) {
      update.updated_by = new Types.ObjectId(userId);
    }
    if (input.target_id) {
      update.target_id = new Types.ObjectId(input.target_id);
    }

    return BannerModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Banner | null> {
    return BannerModel.findByIdAndDelete(id).exec();
  }
}

