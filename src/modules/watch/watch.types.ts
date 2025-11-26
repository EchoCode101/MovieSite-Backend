import type { Types } from "mongoose";
import type { WatchlistItem, WatchTargetType } from "../../models/watchlist.model.js";
import type { WatchHistoryItem, WatchHistoryTargetType } from "../../models/watchHistory.model.js";

export interface WatchlistItemDto {
  id: string;
  user_id: string;
  profile_id: string;
  target_type: WatchTargetType;
  target_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchHistoryItemDto {
  id: string;
  user_id: string;
  profile_id: string;
  target_type: WatchHistoryTargetType;
  target_id: string;
  watched_seconds: number;
  total_seconds: number;
  last_watched_at: Date;
  progress_percent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToWatchlistInput {
  profile_id: string;
  target_type: WatchTargetType;
  target_id: string;
}

export interface UpdateWatchProgressInput {
  profile_id: string;
  target_type: WatchHistoryTargetType;
  target_id: string;
  watched_seconds: number;
  total_seconds: number;
}

export interface ContinueWatchingItem {
  id: string;
  target_type: WatchHistoryTargetType;
  target_id: string;
  watched_seconds: number;
  total_seconds: number;
  progress_percent: number;
  last_watched_at: Date;
  // Populated content info (if needed)
  content?: {
    title?: string;
    thumbnail_url?: string;
  };
}

export function mapWatchlistItemToDto(item: WatchlistItem): WatchlistItemDto {
  return {
    id: item._id?.toString() ?? "",
    user_id: item.user_id.toString(),
    profile_id: item.profile_id.toString(),
    target_type: item.target_type,
    target_id: item.target_id.toString(),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function mapWatchHistoryItemToDto(item: WatchHistoryItem): WatchHistoryItemDto {
  const progress_percent =
    item.total_seconds > 0
      ? Math.round((item.watched_seconds / item.total_seconds) * 100)
      : 0;

  return {
    id: item._id?.toString() ?? "",
    user_id: item.user_id.toString(),
    profile_id: item.profile_id.toString(),
    target_type: item.target_type,
    target_id: item.target_id.toString(),
    watched_seconds: item.watched_seconds,
    total_seconds: item.total_seconds,
    last_watched_at: item.last_watched_at,
    progress_percent,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

