import type { TvShow } from "../../models/tvShow.model.js";

export interface TvShowDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_year?: number;
  genres: string[];
  cast: string[];
  directors: string[];
  access_type: string;
  plan_ids: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  status: string;
}

export interface PaginatedTvShowsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  genre?: string;
  year?: number;
  access_type?: string;
  search?: string;
}

export interface PaginatedTvShowsResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  tvShows: TvShow[];
}

export interface CreateTvShowInput {
  title: string;
  slug?: string;
  description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_year?: number;
  genres?: string[];
  cast?: string[];
  directors?: string[];
  access_type?: "free" | "subscription" | "pay_per_view";
  plan_ids?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  status?: "draft" | "published";
}

export interface UpdateTvShowInput {
  title?: string;
  slug?: string;
  description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_year?: number;
  genres?: string[];
  cast?: string[];
  directors?: string[];
  access_type?: "free" | "subscription" | "pay_per_view";
  plan_ids?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  status?: "draft" | "published";
}

export function mapTvShowToDto(tvShow: TvShow): TvShowDto {
  return {
    id: (tvShow._id as any)?.toString?.() ?? "",
    title: tvShow.title,
    slug: tvShow.slug,
    description: tvShow.description,
    thumbnail_url: tvShow.thumbnail_url,
    poster_url: tvShow.poster_url,
    banner_url: tvShow.banner_url,
    language: tvShow.language,
    imdb_rating: tvShow.imdb_rating,
    content_rating: tvShow.content_rating,
    release_year: tvShow.release_year,
    genres: tvShow.genres.map((id) => id.toString()),
    cast: tvShow.cast.map((id) => id.toString()),
    directors: tvShow.directors.map((id) => id.toString()),
    access_type: tvShow.access_type,
    plan_ids: tvShow.plan_ids.map((id) => id.toString()),
    seo_title: tvShow.seo_title,
    seo_description: tvShow.seo_description,
    seo_keywords: tvShow.seo_keywords,
    status: tvShow.status,
  };
}

