import type { Movie } from "../../models/movie.model.js";
import type { Types } from "mongoose";

export interface MovieDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  trailer_url_type: string;
  trailer_url?: string;
  streams: Array<{ label?: string; type?: string; url: string }>;
  access_type: string;
  plan_ids: string[];
  pay_per_view_price?: number;
  purchase_type: string;
  access_duration_hours?: number;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_date?: Date;
  duration_minutes?: number;
  genres: string[];
  cast: string[];
  directors: string[];
  tags: string[];
  is_premium: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_coming_soon: boolean;
  is_downloadable: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  status: string;
}

export interface MovieWithStats extends Movie {
  metrics?: {
    views_count?: number;
    shares_count?: number;
    favorites_count?: number;
    reports_count?: number;
  };
  likes_count?: number;
  dislikes_count?: number;
  average_rating?: number | null;
}

export interface PaginatedMoviesParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  genre?: string;
  year?: number;
  access_type?: string;
  is_featured?: boolean;
  is_trending?: boolean;
  is_coming_soon?: boolean;
  search?: string;
}

export interface PaginatedMoviesResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  movies: MovieWithStats[];
}

export interface CreateMovieInput {
  title: string;
  slug?: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  trailer_url_type?: "youtube" | "vimeo" | "mp4" | "hls";
  trailer_url?: string;
  streams?: Array<{ label?: string; type?: string; url: string }>;
  access_type?: "free" | "subscription" | "pay_per_view";
  plan_ids?: string[];
  pay_per_view_price?: number;
  purchase_type?: "rent" | "buy";
  access_duration_hours?: number;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_date?: Date;
  duration_minutes?: number;
  genres?: string[];
  cast?: string[];
  directors?: string[];
  tags?: string[];
  is_premium?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  is_coming_soon?: boolean;
  is_downloadable?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  status?: "draft" | "published";
}

export interface UpdateMovieInput {
  title?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  poster_url?: string;
  banner_url?: string;
  trailer_url_type?: "youtube" | "vimeo" | "mp4" | "hls";
  trailer_url?: string;
  streams?: Array<{ label?: string; type?: string; url: string }>;
  access_type?: "free" | "subscription" | "pay_per_view";
  plan_ids?: string[];
  pay_per_view_price?: number;
  purchase_type?: "rent" | "buy";
  access_duration_hours?: number;
  language?: string;
  imdb_rating?: number;
  content_rating?: string;
  release_date?: Date;
  duration_minutes?: number;
  genres?: string[];
  cast?: string[];
  directors?: string[];
  tags?: string[];
  is_premium?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  is_coming_soon?: boolean;
  is_downloadable?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  status?: "draft" | "published";
}

export function mapMovieToDto(movie: Movie): MovieDto {
  return {
    id: (movie._id as any)?.toString?.() ?? "",
    title: movie.title,
    slug: movie.slug,
    description: movie.description,
    short_description: movie.short_description,
    thumbnail_url: movie.thumbnail_url,
    poster_url: movie.poster_url,
    banner_url: movie.banner_url,
    trailer_url_type: movie.trailer_url_type,
    trailer_url: movie.trailer_url,
    streams: movie.streams,
    access_type: movie.access_type,
    plan_ids: movie.plan_ids.map((id) => id.toString()),
    pay_per_view_price: movie.pay_per_view_price,
    purchase_type: movie.purchase_type,
    access_duration_hours: movie.access_duration_hours,
    language: movie.language,
    imdb_rating: movie.imdb_rating,
    content_rating: movie.content_rating,
    release_date: movie.release_date,
    duration_minutes: movie.duration_minutes,
    genres: movie.genres.map((id) => id.toString()),
    cast: movie.cast.map((id) => id.toString()),
    directors: movie.directors.map((id) => id.toString()),
    tags: movie.tags.map((id) => id.toString()),
    is_premium: movie.is_premium,
    is_featured: movie.is_featured,
    is_trending: movie.is_trending,
    is_coming_soon: movie.is_coming_soon,
    is_downloadable: movie.is_downloadable,
    seo_title: movie.seo_title,
    seo_description: movie.seo_description,
    seo_keywords: movie.seo_keywords,
    status: movie.status,
  };
}

