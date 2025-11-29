import type { Season } from "../../models/season.model.js";

export interface SeasonDto {
  id: string;
  tv_show_id: string;
  season_number: number;
  name?: string;
  description?: string;
  poster_url?: string;
  release_date?: Date;
  seo_title?: string;
  seo_description?: string;
  status: string;
}

export interface CreateSeasonInput {
  tv_show_id: string;
  season_number: number;
  name?: string;
  description?: string;
  poster_url?: string;
  release_date?: Date;
  seo_title?: string;
  seo_description?: string;
  status?: "draft" | "published";
}

export interface UpdateSeasonInput {
  name?: string;
  description?: string;
  poster_url?: string;
  release_date?: Date;
  seo_title?: string;
  seo_description?: string;
  status?: "draft" | "published";
}

export function mapSeasonToDto(season: Season): SeasonDto {
  return {
    id: (season._id as any)?.toString?.() ?? "",
    tv_show_id: season.tv_show_id.toString(),
    season_number: season.season_number,
    name: season.name,
    description: season.description,
    poster_url: season.poster_url,
    release_date: season.release_date,
    seo_title: season.seo_title,
    seo_description: season.seo_description,
    status: season.status,
  };
}

