import createError from "http-errors";
import { SettingsRepository } from "./settings.repository.js";
import type {
  CreateSettingInput,
  SettingDto,
  UpdateSettingInput,
} from "./settings.types.js";
import { mapSettingToDto } from "./settings.types.js";

export class SettingsService {
  private repo: SettingsRepository;

  constructor(repo = new SettingsRepository()) {
    this.repo = repo;
  }

  async listAllSettings(): Promise<SettingDto[]> {
    const settings = await this.repo.findAll();
    return settings.map(mapSettingToDto);
  }

  async getSettingByKey(key: string): Promise<SettingDto> {
    const setting = await this.repo.findByKey(key);
    if (!setting) {
      throw createError(404, "Setting not found");
    }
    return mapSettingToDto(setting);
  }

  async getSettingsByGroup(group: string): Promise<SettingDto[]> {
    const settings = await this.repo.findByGroup(group);
    return settings.map(mapSettingToDto);
  }

  async createOrUpdateSetting(input: CreateSettingInput): Promise<SettingDto> {
    const setting = await this.repo.createOrUpdate(input);
    return mapSettingToDto(setting);
  }

  async updateSetting(key: string, input: UpdateSettingInput): Promise<SettingDto> {
    const existing = await this.repo.findByKey(key);
    if (!existing) {
      throw createError(404, "Setting not found");
    }

    const updated = await this.repo.updateByKey(key, input);
    if (!updated) {
      throw createError(404, "Setting not found");
    }
    return mapSettingToDto(updated);
  }

  async deleteSetting(key: string): Promise<void> {
    const existing = await this.repo.findByKey(key);
    if (!existing) {
      throw createError(404, "Setting not found");
    }
    await this.repo.deleteByKey(key);
  }
}

