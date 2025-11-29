import { CastCrewModel, type CastCrew } from "../../models/castCrew.model.js";
import type { CreateCastCrewInput, UpdateCastCrewInput, CastCrewFilters } from "./castCrew.types.js";

export class CastCrewRepository {
  async findAll(filters?: CastCrewFilters): Promise<CastCrew[]> {
    const query: any = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }

    return CastCrewModel.find(query).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<CastCrew | null> {
    return CastCrewModel.findById(id).exec();
  }

  async create(input: CreateCastCrewInput): Promise<CastCrew> {
    const doc = await CastCrewModel.create(input);
    return doc;
  }

  async updateById(id: string, update: UpdateCastCrewInput): Promise<CastCrew | null> {
    return CastCrewModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<CastCrew | null> {
    return CastCrewModel.findByIdAndDelete(id).exec();
  }
}

