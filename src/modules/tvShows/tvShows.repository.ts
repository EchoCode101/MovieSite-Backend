import { Types } from "mongoose";
import { TvShowModel, type TvShow } from "../../models/tvShow.model.js";
import type { CreateTvShowInput, UpdateTvShowInput, PaginatedTvShowsParams } from "./tvShows.types.js";

export class TvShowsRepository {
  async findAll(): Promise<TvShow[]> {
    return TvShowModel.find({ deleted_at: null })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<TvShow | null> {
    return TvShowModel.findOne({ _id: id, deleted_at: null }).exec();
  }

  async findBySlug(slug: string): Promise<TvShow | null> {
    return TvShowModel.findOne({ slug, deleted_at: null }).exec();
  }

  async findPaginated(
    params: PaginatedTvShowsParams,
  ): Promise<{ tvShows: TvShow[]; totalItems: number }> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "DESC",
      genre,
      year,
      access_type,
      search,
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    const matchStage: any = { deleted_at: null, status: "published" };

    if (genre && genre !== "All" && genre.trim() !== "") {
      matchStage.genres = new Types.ObjectId(genre);
    }

    // Filter by year (using release_year field)
    if (year) {
      matchStage.release_year = year;
    }

    if (access_type) {
      matchStage.access_type = access_type;
    }

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const query = TvShowModel.find(matchStage);

    // Apply sorting
    const sortField = sort === "release_year" ? "release_year" : sort;
    query.sort({ [sortField]: sortOrder });

    // Get total count
    const totalItems = await TvShowModel.countDocuments(matchStage);

    // Apply pagination
    const tvShows = await query.skip(skip).limit(Number(limit)).exec();

    return { tvShows, totalItems };
  }

  async findByTvShowId(tvShowId: string): Promise<TvShow | null> {
    return this.findById(tvShowId);
  }

  async create(input: CreateTvShowInput, userId: string): Promise<TvShow> {
    const slug =
      input.slug ||
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = await this.findBySlug(slug);
    if (existing) {
      throw new Error("TV Show with this slug already exists");
    }

    const doc = await TvShowModel.create({
      ...input,
      slug,
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateTvShowInput, userId?: string): Promise<TvShow | null> {
    const update: any = { ...input };
    if (userId) {
      update.updated_by = new Types.ObjectId(userId);
    }

    if (input.slug) {
      const existing = await this.findBySlug(input.slug);
      if (existing && (existing._id as any).toString() !== id) {
        throw new Error("TV Show with this slug already exists");
      }
    }

    return TvShowModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<TvShow | null> {
    return TvShowModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true },
    ).exec();
  }
}

