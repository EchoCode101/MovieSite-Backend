import createError from "http-errors";
import { EpisodesRepository } from "./episodes.repository.js";
import type { CreateEpisodeInput, EpisodeDto, UpdateEpisodeInput, PaginatedEpisodesParams, PaginatedEpisodesResponse } from "./episodes.types.js";
import { mapEpisodeToDto } from "./episodes.types.js";
import { checkContentAccess } from "../../utils/accessControl.js";
import { SeasonModel } from "../../models/season.model.js";
import { TvShowModel } from "../../models/tvShow.model.js";

export class EpisodesService {
  private repo: EpisodesRepository;

  constructor(repo = new EpisodesRepository()) {
    this.repo = repo;
  }

  async listEpisodes(): Promise<EpisodeDto[]> {
    const episodes = await this.repo.findAll();
    return episodes.map(mapEpisodeToDto);
  }

  async getPaginatedEpisodes(
    params: PaginatedEpisodesParams,
    userId?: string,
  ): Promise<PaginatedEpisodesResponse> {
    const { page = 1, limit = 10 } = params;
    // Access control is now handled in the repository aggregation pipeline
    const { episodes, totalItems } = await this.repo.findPaginated(params, userId);

    return {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      episodes: episodes.map(mapEpisodeToDto),
    };
  }

  async getEpisodeById(id: string, userId?: string): Promise<EpisodeDto> {
    const episode = await this.repo.findById(id);
    if (!episode) {
      throw createError(404, "Episode not found");
    }

    // Check access
    const hasAccess = await checkContentAccess(
      userId,
      episode.access_type,
      episode.plan_ids,
      "episode" as any,
      id,
    );

    if (!hasAccess) {
      throw createError(403, "You do not have access to this episode");
    }

    return mapEpisodeToDto(episode);
  }

  async getEpisodesBySeason(seasonId: string, userId?: string): Promise<EpisodeDto[]> {
    // Verify season exists
    const season = await SeasonModel.findById(seasonId);
    if (!season) {
      throw createError(404, "Season not found");
    }

    const episodes = await this.repo.findBySeasonId(seasonId);
    
    // Filter based on access
    const accessibleEpisodes: EpisodeDto[] = [];
    for (const episode of episodes) {
      const hasAccess = await checkContentAccess(
        userId,
        episode.access_type,
        episode.plan_ids,
        "episode" as any,
        (episode._id as any).toString(),
      );
      if (hasAccess) {
        accessibleEpisodes.push(mapEpisodeToDto(episode));
      }
    }

    return accessibleEpisodes;
  }

  async createEpisode(input: CreateEpisodeInput, userId: string): Promise<EpisodeDto> {
    // Verify TV show and season exist
    const tvShow = await TvShowModel.findById(input.tv_show_id);
    if (!tvShow) {
      throw createError(404, "TV Show not found");
    }

    const season = await SeasonModel.findById(input.season_id);
    if (!season) {
      throw createError(404, "Season not found");
    }

    // Verify season belongs to TV show
    if (season.tv_show_id.toString() !== input.tv_show_id) {
      throw createError(400, "Season does not belong to the specified TV show");
    }

    // Check if episode number already exists
    const existing = await this.repo.findBySeasonId(input.season_id);
    const episodeExists = existing.some((e) => e.episode_number === input.episode_number);
    if (episodeExists) {
      throw createError(409, "Episode number already exists for this season");
    }

    const episode = await this.repo.create(input, userId);
    return mapEpisodeToDto(episode);
  }

  async updateEpisode(id: string, input: UpdateEpisodeInput, userId: string): Promise<EpisodeDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Episode not found");
    }

    const updated = await this.repo.updateById(id, input, userId);
    if (!updated) {
      throw createError(404, "Episode not found");
    }
    return mapEpisodeToDto(updated);
  }

  async deleteEpisode(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Episode not found");
    }
    await this.repo.deleteById(id);
  }
}

