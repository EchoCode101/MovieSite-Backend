import { Types } from "mongoose";
import { SeasonModel, type Season } from "../../models/season.model.js";
import type { CreateSeasonInput, UpdateSeasonInput } from "./seasons.types.js";

export class SeasonsRepository {
  async findAll(): Promise<Season[]> {
    return SeasonModel.find({ deleted_at: null })
      .sort({ season_number: 1 })
      .exec();
  }

  async findById(id: string): Promise<Season | null> {
    return SeasonModel.findOne({ _id: id, deleted_at: null }).exec();
  }

  async findByTvShowId(tvShowId: string): Promise<Season[]> {
    return SeasonModel.find({
      tv_show_id: tvShowId,
      deleted_at: null,
      status: "published",
    })
      .sort({ season_number: 1 })
      .exec();
  }

  async create(input: CreateSeasonInput, userId: string): Promise<Season> {
    const doc = await SeasonModel.create({
      ...input,
      tv_show_id: new Types.ObjectId(input.tv_show_id),
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateSeasonInput, userId?: string): Promise<Season | null> {
    const update: any = { ...input };
    if (userId) {
      update.updated_by = new Types.ObjectId(userId);
    }

    return SeasonModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Season | null> {
    return SeasonModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true },
    ).exec();
  }
}

