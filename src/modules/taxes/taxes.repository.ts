import { TaxModel, type Tax } from "../../models/tax.model.js";
import type { CreateTaxInput, UpdateTaxInput } from "./taxes.types.js";

export class TaxesRepository {
  async findAll(): Promise<Tax[]> {
    return TaxModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Tax | null> {
    return TaxModel.findById(id).exec();
  }

  async findByCountry(country: string): Promise<Tax | null> {
    return TaxModel.findOne({ country, is_active: true }).exec();
  }

  async findActive(): Promise<Tax[]> {
    return TaxModel.find({ is_active: true }).sort({ name: 1 }).exec();
  }

  async create(input: CreateTaxInput): Promise<Tax> {
    const doc = await TaxModel.create(input);
    return doc;
  }

  async updateById(id: string, input: UpdateTaxInput): Promise<Tax | null> {
    return TaxModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Tax | null> {
    return TaxModel.findByIdAndDelete(id).exec();
  }
}

