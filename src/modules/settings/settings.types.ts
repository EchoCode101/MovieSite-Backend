import type { Setting } from "../../models/setting.model.js";

export interface SettingDto {
  key: string;
  value: unknown;
  group: string;
}

export interface CreateSettingInput {
  key: string;
  value: unknown;
  group: "app" | "payment" | "auth" | "firebase" | "ads" | "tmdb" | "mail" | "seo";
}

export interface UpdateSettingInput {
  value?: unknown;
  group?: "app" | "payment" | "auth" | "firebase" | "ads" | "tmdb" | "mail" | "seo";
}

export function mapSettingToDto(setting: Setting): SettingDto {
  return {
    key: setting.key,
    value: setting.value,
    group: setting.group,
  };
}

