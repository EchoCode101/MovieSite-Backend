import { SettingModel, type Setting } from "../../models/setting.model.js";
import type { CreateSettingInput, UpdateSettingInput } from "./settings.types.js";

export class SettingsRepository {
  async findAll(): Promise<Setting[]> {
    return SettingModel.find().sort({ group: 1, key: 1 }).exec();
  }

  async findByKey(key: string): Promise<Setting | null> {
    return SettingModel.findOne({ key }).exec();
  }

  async findByGroup(group: string): Promise<Setting[]> {
    return SettingModel.find({ group }).sort({ key: 1 }).exec();
  }

  async createOrUpdate(input: CreateSettingInput): Promise<Setting> {
    return SettingModel.findOneAndUpdate(
      { key: input.key },
      { ...input },
      { upsert: true, new: true, runValidators: true },
    ).exec() as Promise<Setting>;
  }

  async updateByKey(key: string, input: UpdateSettingInput): Promise<Setting | null> {
    return SettingModel.findOneAndUpdate(
      { key },
      input,
      { new: true, runValidators: true },
    ).exec();
  }

  async deleteByKey(key: string): Promise<Setting | null> {
    return SettingModel.findOneAndDelete({ key }).exec();
  }
}

