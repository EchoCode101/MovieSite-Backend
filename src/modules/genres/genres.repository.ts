import { GenreModel, type Genre } from "../../models/genre.model.js";
import type { CreateGenreInput, UpdateGenreInput } from "./genres.types.js";

export class GenresRepository {
  async findAll(): Promise<Genre[]> {
    return GenreModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Genre | null> {
    return GenreModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<Genre | null> {
    return GenreModel.findOne({ slug }).exec();
  }

  async create(input: CreateGenreInput): Promise<Genre> {
    // Auto-generate slug if not provided
    const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-");
    const doc = await GenreModel.create({
      ...input,
      slug,
    });
    return doc;
  }

  async updateById(id: string, update: UpdateGenreInput): Promise<Genre | null> {
    return GenreModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Genre | null> {
    return GenreModel.findByIdAndDelete(id).exec();
  }
}

