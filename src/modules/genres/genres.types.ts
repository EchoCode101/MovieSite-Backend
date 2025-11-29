import type { Genre } from "../../models/genre.model.js";

export interface GenreDto {
  id: string;
  name: string;
  slug: string;
}

export interface CreateGenreInput {
  name: string;
  slug?: string;
}

export interface UpdateGenreInput {
  name?: string;
  slug?: string;
}

export function mapGenreToDto(genre: Genre): GenreDto {
  return {
    id: (genre._id as any)?.toString?.() ?? "",
    name: genre.name,
    slug: genre.slug,
  };
}

