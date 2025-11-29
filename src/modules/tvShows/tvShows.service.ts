import createError from "http-errors";
import { TvShowsRepository } from "./tvShows.repository.js";
import type {
  CreateTvShowInput,
  UpdateTvShowInput,
  PaginatedTvShowsParams,
  PaginatedTvShowsResponse,
  TvShowDto,
} from "./tvShows.types.js";
import { mapTvShowToDto } from "./tvShows.types.js";
import { checkContentAccess } from "../../utils/accessControl.js";
import type { TvShow } from "../../models/tvShow.model.js";

export class TvShowsService {
  private repository: TvShowsRepository;

  constructor(repository = new TvShowsRepository()) {
    this.repository = repository;
  }

  async getAllTvShows(): Promise<TvShow[]> {
    return await this.repository.findAll();
  }

  async getTvShowById(id: string, userId?: string): Promise<TvShowDto> {
    const tvShow = await this.repository.findById(id);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }

    const hasAccess = await checkContentAccess(
      userId,
      tvShow.access_type,
      tvShow.plan_ids,
      "tvshow" as any,
      id,
    );

    if (!hasAccess) {
      throw createError(403, "You do not have access to this TV show");
    }

    return mapTvShowToDto(tvShow);
  }

  async getPaginatedTvShows(
    params: PaginatedTvShowsParams,
    userId?: string,
  ): Promise<PaginatedTvShowsResponse> {
    const { page = 1, limit = 10 } = params;
    const { tvShows, totalItems } = await this.repository.findPaginated(params);

    // Filter based on access
    const accessibleTvShows: TvShow[] = [];
    for (const tvShow of tvShows) {
      const hasAccess = await checkContentAccess(
        userId,
        tvShow.access_type,
        tvShow.plan_ids,
        "tvshow" as any,
        (tvShow._id as any).toString(),
      );
      if (hasAccess) {
        accessibleTvShows.push(tvShow);
      }
    }

    return {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      tvShows: accessibleTvShows,
    };
  }

  async getTvShowSeasons(tvShowId: string): Promise<any[]> {
    const tvShow = await this.repository.findById(tvShowId);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }
    // Seasons will be fetched by seasons module
    return [];
  }

  async createTvShow(data: CreateTvShowInput, userId: string): Promise<TvShowDto> {
    if (!data.title) {
      throw createError(400, "Title is required");
    }

    const tvShow = await this.repository.create(data, userId);
    return mapTvShowToDto(tvShow);
  }

  async updateTvShow(id: string, data: UpdateTvShowInput, userId: string): Promise<TvShowDto> {
    const tvShow = await this.repository.updateById(id, data, userId);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }
    return mapTvShowToDto(tvShow);
  }

  async deleteTvShow(id: string): Promise<void> {
    const tvShow = await this.repository.deleteById(id);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }
  }
}

