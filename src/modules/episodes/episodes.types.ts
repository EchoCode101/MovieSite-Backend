import type { Episode } from "../../models/episode.model.js";

export interface EpisodeDto {
  id: string;
  tv_show_id: string;
  season_id: string;
  episode_number: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  streams: Array<{ label?: string; type?: string; url: string }>;
  enable_subtitle: boolean;
  subtitles: Array<{ language: string; is_default: boolean; url: string }>;
  duration_minutes?: number;
  release_date?: Date;
  access_type: string;
  plan_ids: string[];
  pay_per_view_price?: number;
  seo_title?: string;
  seo_description?: string;
  status: string;
}

export interface CreateEpisodeInput {
  tv_show_id: string;
  season_id: string;
  episode_number: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  streams?: Array<{ label?: string; type?: string; url: string }>;
  enable_subtitle?: boolean;
  subtitles?: Array<{ language: string; is_default: boolean; url: string }>;
  duration_minutes?: number;
  release_date?: Date;
  access_type?: "free" | "subscription" | "pay_per_view";
  plan_ids?: string[];
  pay_per_view_price?: number;
  seo_title?: string;
  seo_description?: string;
  status?: "draft" | "published";
}

export interface UpdateEpisodeInput {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  streams?: Array<{ label?: string; type?: string; url: string }>;
  enable_subtitle?: boolean;
  subtitles?: Array<{ language: string; is_default: boolean; url: string }>;
  duration_minutes?: number;
  release_date?: Date;
  access_type?: "free" | "subscription" | "pay_per_view";
  plan_ids?: string[];
  pay_per_view_price?: number;
  seo_title?: string;
  seo_description?: string;
  status?: "draft" | "published";
}

export interface EpisodeWithStats extends Episode {
  likes_count?: number;
  dislikes_count?: number;
  views_count?: number;
  average_rating?: number | null;
}

export interface PaginatedEpisodesParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  genre?: string;
  year?: number;
  access_type?: string;
  search?: string;
  tv_show_id?: string;
  season_id?: string;
}

export interface PaginatedEpisodesResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  episodes: EpisodeDto[];
}

export function mapEpisodeToDto(episode: Episode): EpisodeDto {
  return {
    id: (episode._id as any)?.toString?.() ?? "",
    tv_show_id: episode.tv_show_id.toString(),
    season_id: episode.season_id.toString(),
    episode_number: episode.episode_number,
    title: episode.title,
    description: episode.description,
    thumbnail_url: episode.thumbnail_url,
    streams: episode.streams,
    enable_subtitle: episode.enable_subtitle,
    subtitles: episode.subtitles,
    duration_minutes: episode.duration_minutes,
    release_date: episode.release_date,
    access_type: episode.access_type,
    plan_ids: episode.plan_ids.map((id) => id.toString()),
    pay_per_view_price: episode.pay_per_view_price,
    seo_title: episode.seo_title,
    seo_description: episode.seo_description,
    status: episode.status,
  };
}

