import createError from "http-errors";
import { SeasonsRepository } from "./seasons.repository.js";
import type { CreateSeasonInput, SeasonDto, UpdateSeasonInput } from "./seasons.types.js";
import { mapSeasonToDto } from "./seasons.types.js";
import { TvShowModel } from "../../models/tvShow.model.js";

export class SeasonsService {
  private repo: SeasonsRepository;

  constructor(repo = new SeasonsRepository()) {
    this.repo = repo;
  }

  async listSeasons(): Promise<SeasonDto[]> {
    const seasons = await this.repo.findAll();
    return seasons.map(mapSeasonToDto);
  }

  async getSeasonById(id: string): Promise<SeasonDto> {
    const season = await this.repo.findById(id);
    if (!season) {
      throw createError(404, "Season not found");
    }
    return mapSeasonToDto(season);
  }

  async getSeasonsByTvShow(tvShowId: string): Promise<SeasonDto[]> {
    // Verify TV show exists
    const tvShow = await TvShowModel.findById(tvShowId);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }

    const seasons = await this.repo.findByTvShowId(tvShowId);
    return seasons.map(mapSeasonToDto);
  }

  async createSeason(input: CreateSeasonInput, userId: string): Promise<SeasonDto> {
    // Verify TV show exists
    const tvShow = await TvShowModel.findById(input.tv_show_id);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }

    // Check if season number already exists
    const existing = await this.repo.findByTvShowId(input.tv_show_id);
    const seasonExists = existing.some((s) => s.season_number === input.season_number);
    if (seasonExists) {
      throw createError(409, "Season number already exists for this TV show");
    }

    const season = await this.repo.create(input, userId);
    return mapSeasonToDto(season);
  }

  async updateSeason(id: string, input: UpdateSeasonInput, userId: string): Promise<SeasonDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Season not found");
    }

    const updated = await this.repo.updateById(id, input, userId);
    if (!updated) {
      throw createError(404, "Season not found");
    }
    return mapSeasonToDto(updated);
  }

  async deleteSeason(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Season not found");
    }
    await this.repo.deleteById(id);
  }
}

