import { WatchRepository } from "./watch.repository.js";
import type {
  AddToWatchlistInput,
  ContinueWatchingItem,
  UpdateWatchProgressInput,
  WatchHistoryItemDto,
  WatchlistItemDto,
} from "./watch.types.js";
import { mapWatchHistoryItemToDto, mapWatchlistItemToDto } from "./watch.types.js";
import createError from "http-errors";

export class WatchService {
  private watchRepository: WatchRepository;

  constructor(watchRepository = new WatchRepository()) {
    this.watchRepository = watchRepository;
  }

  async addToWatchlist(userId: string, input: AddToWatchlistInput): Promise<WatchlistItemDto> {
    const item = await this.watchRepository.addToWatchlist(
      userId,
      input.profile_id,
      input.target_type,
      input.target_id,
    );
    return mapWatchlistItemToDto(item);
  }

  async removeFromWatchlist(
    userId: string,
    profileId: string,
    targetType: "movie" | "tvshow" | "episode",
    targetId: string,
  ): Promise<void> {
    const removed = await this.watchRepository.removeFromWatchlist(
      userId,
      profileId,
      targetType,
      targetId,
    );
    if (!removed) {
      throw createError(404, "Watchlist item not found");
    }
  }

  async getUserWatchlist(
    userId: string,
    filters: {
      profileId?: string;
      targetType?: "movie" | "tvshow" | "episode";
      page?: number;
      limit?: number;
    },
  ): Promise<{ items: WatchlistItemDto[]; total: number; currentPage: number; totalPages: number }> {
    const { items, total } = await this.watchRepository.getUserWatchlist(userId, filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    return {
      items: items.map(mapWatchlistItemToDto),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateWatchProgress(
    userId: string,
    input: UpdateWatchProgressInput,
  ): Promise<WatchHistoryItemDto> {
    if (input.watched_seconds > input.total_seconds) {
      throw createError(400, "watched_seconds cannot exceed total_seconds");
    }

    const item = await this.watchRepository.upsertWatchHistory(
      userId,
      input.profile_id,
      input.target_type,
      input.target_id,
      input.watched_seconds,
      input.total_seconds,
    );

    return mapWatchHistoryItemToDto(item);
  }

  async getContinueWatching(
    userId: string,
    profileId: string,
    limit: number = 20,
  ): Promise<ContinueWatchingItem[]> {
    const items = await this.watchRepository.getContinueWatching(userId, profileId, limit);

    return items.map((item) => {
      const dto = mapWatchHistoryItemToDto(item);
      return {
        id: dto.id,
        target_type: dto.target_type,
        target_id: dto.target_id,
        watched_seconds: dto.watched_seconds,
        total_seconds: dto.total_seconds,
        progress_percent: dto.progress_percent,
        last_watched_at: dto.last_watched_at,
      };
    });
  }

  async removeWatchHistory(
    userId: string,
    profileId: string,
    targetType: "movie" | "episode",
    targetId: string,
  ): Promise<void> {
    const removed = await this.watchRepository.removeWatchHistory(
      userId,
      profileId,
      targetType,
      targetId,
    );
    if (!removed) {
      throw createError(404, "Watch history item not found");
    }
  }
}

