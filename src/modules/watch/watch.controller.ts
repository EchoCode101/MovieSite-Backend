import type { Request, Response, NextFunction } from "express";
import { WatchService } from "./watch.service.js";
import logger from "../../config/logger.js";

const watchService = new WatchService();

export const addToWatchlistController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const item = await watchService.addToWatchlist(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Item added to watchlist successfully",
      data: item,
    });
  } catch (error) {
    logger.error("Error adding to watchlist (TS controller):", error);
    next(error);
  }
};

export const removeFromWatchlistController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { profile_id, target_type, target_id } = req.body;

    await watchService.removeFromWatchlist(userId, profile_id, target_type, target_id);
    res.status(200).json({
      success: true,
      message: "Item removed from watchlist successfully",
    });
  } catch (error) {
    logger.error("Error removing from watchlist (TS controller):", error);
    next(error);
  }
};

export const getWatchlistController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profileId = req.query.profile_id as string | undefined;
    const targetType = req.query.target_type as "movie" | "tvshow" | "episode" | undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await watchService.getUserWatchlist(userId, {
      profileId,
      targetType,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Watchlist retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching watchlist (TS controller):", error);
    next(error);
  }
};

export const updateWatchProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const item = await watchService.updateWatchProgress(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Watch progress updated successfully",
      data: item,
    });
  } catch (error) {
    logger.error("Error updating watch progress (TS controller):", error);
    next(error);
  }
};

export const getContinueWatchingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profileId = req.query.profile_id as string;
    const limit = Number(req.query.limit ?? 20);

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "profile_id is required",
      });
      return;
    }

    const items = await watchService.getContinueWatching(userId, profileId, limit);
    res.status(200).json({
      success: true,
      message: "Continue watching retrieved successfully",
      data: items,
    });
  } catch (error) {
    logger.error("Error fetching continue watching (TS controller):", error);
    next(error);
  }
};

export const removeWatchHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { profile_id, target_type, target_id } = req.body;

    await watchService.removeWatchHistory(userId, profile_id, target_type, target_id);
    res.status(200).json({
      success: true,
      message: "Watch history item removed successfully",
    });
  } catch (error) {
    logger.error("Error removing watch history (TS controller):", error);
    next(error);
  }
};

