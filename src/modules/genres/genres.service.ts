import createError from "http-errors";
import { GenresRepository } from "./genres.repository.js";
import type { CreateGenreInput, GenreDto, UpdateGenreInput } from "./genres.types.js";
import { mapGenreToDto } from "./genres.types.js";

export class GenresService {
  private repo: GenresRepository;

  constructor(repo = new GenresRepository()) {
    this.repo = repo;
  }

  async listGenres(): Promise<GenreDto[]> {
    const genres = await this.repo.findAll();
    return genres.map(mapGenreToDto);
  }

  async getGenreById(id: string): Promise<GenreDto> {
    const genre = await this.repo.findById(id);
    if (!genre) {
      throw createError(404, "Genre not found");
    }
    return mapGenreToDto(genre);
  }

  async createGenre(input: CreateGenreInput): Promise<GenreDto> {
    // Check if slug already exists
    if (input.slug) {
      const existing = await this.repo.findBySlug(input.slug);
      if (existing) {
        throw createError(409, "Genre with this slug already exists");
      }
    }

    const genre = await this.repo.create(input);
    return mapGenreToDto(genre);
  }

  async updateGenre(id: string, update: UpdateGenreInput): Promise<GenreDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Genre not found");
    }

    // Check slug uniqueness if updating slug
    if (update.slug && update.slug !== existing.slug) {
      const slugExists = await this.repo.findBySlug(update.slug);
      if (slugExists) {
        throw createError(409, "Genre with this slug already exists");
      }
    }

    const updated = await this.repo.updateById(id, update);
    if (!updated) {
      throw createError(404, "Genre not found");
    }
    return mapGenreToDto(updated);
  }

  async deleteGenre(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Genre not found");
    }
    await this.repo.deleteById(id);
  }
}

