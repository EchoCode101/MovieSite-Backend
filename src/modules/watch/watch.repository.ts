import { WatchlistModel, type WatchlistItem, type WatchTargetType } from "../../models/watchlist.model.js";
import {
  WatchHistoryModel,
  type WatchHistoryItem,
  type WatchHistoryTargetType,
} from "../../models/watchHistory.model.js";
import { Types } from "mongoose";
import createError from "http-errors";

export class WatchRepository {
  // Watchlist operations
  async findWatchlistItem(
    userId: string,
    profileId: string,
    targetType: WatchTargetType,
    targetId: string,
  ): Promise<WatchlistItem | null> {
    return WatchlistModel.findOne({
      user_id: new Types.ObjectId(userId),
      profile_id: new Types.ObjectId(profileId),
      target_type: targetType,
      target_id: new Types.ObjectId(targetId),
    }).exec();
  }

  async addToWatchlist(
    userId: string,
    profileId: string,
    targetType: WatchTargetType,
    targetId: string,
  ): Promise<WatchlistItem> {
    const existing = await this.findWatchlistItem(userId, profileId, targetType, targetId);
    if (existing) {
      throw createError(409, "Item already in watchlist");
    }

    return WatchlistModel.create({
      user_id: new Types.ObjectId(userId),
      profile_id: new Types.ObjectId(profileId),
      target_type: targetType,
      target_id: new Types.ObjectId(targetId),
    });
  }

  async removeFromWatchlist(
    userId: string,
    profileId: string,
    targetType: WatchTargetType,
    targetId: string,
  ): Promise<WatchlistItem | null> {
    return WatchlistModel.findOneAndDelete({
      user_id: new Types.ObjectId(userId),
      profile_id: new Types.ObjectId(profileId),
      target_type: targetType,
      target_id: new Types.ObjectId(targetId),
    }).exec();
  }

  async getUserWatchlist(
    userId: string,
    filters: {
      profileId?: string;
      targetType?: WatchTargetType;
      page?: number;
      limit?: number;
    },
  ): Promise<{ items: WatchlistItem[]; total: number }> {
    const { profileId, targetType, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      user_id: new Types.ObjectId(userId),
    };

    if (profileId) {
      query.profile_id = new Types.ObjectId(profileId);
    }

    if (targetType) {
      query.target_type = targetType;
    }

    const [items, total] = await Promise.all([
      WatchlistModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      WatchlistModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  // Watch history operations
  async upsertWatchHistory(
    userId: string,
    profileId: string,
    targetType: WatchHistoryTargetType,
    targetId: string,
    watchedSeconds: number,
    totalSeconds: number,
  ): Promise<WatchHistoryItem> {
    return WatchHistoryModel.findOneAndUpdate(
      {
        user_id: new Types.ObjectId(userId),
        profile_id: new Types.ObjectId(profileId),
        target_type: targetType,
        target_id: new Types.ObjectId(targetId),
      },
      {
        watched_seconds: watchedSeconds,
        total_seconds: totalSeconds,
        last_watched_at: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  async getContinueWatching(
    userId: string,
    profileId: string,
    limit: number = 20,
  ): Promise<WatchHistoryItem[]> {
    return WatchHistoryModel.find({
      user_id: new Types.ObjectId(userId),
      profile_id: new Types.ObjectId(profileId),
    })
      .sort({ last_watched_at: -1 })
      .limit(limit)
      .exec();
  }

  async getWatchHistoryByTarget(
    userId: string,
    profileId: string,
    targetType: WatchHistoryTargetType,
    targetId: string,
  ): Promise<WatchHistoryItem | null> {
    return WatchHistoryModel.findOne({
      user_id: new Types.ObjectId(userId),
      profile_id: new Types.ObjectId(profileId),
      target_type: targetType,
      target_id: new Types.ObjectId(targetId),
    }).exec();
  }

  async removeWatchHistory(
    userId: string,
    profileId: string,
    targetType: WatchHistoryTargetType,
    targetId: string,
  ): Promise<WatchHistoryItem | null> {
    return WatchHistoryModel.findOneAndDelete({
      user_id: new Types.ObjectId(userId),
      profile_id: new Types.ObjectId(profileId),
      target_type: targetType,
      target_id: new Types.ObjectId(targetId),
    }).exec();
  }
}

