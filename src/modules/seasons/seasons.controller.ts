import type { Request, Response, NextFunction } from "express";
import { SeasonsService } from "./seasons.service.js";
import logger from "../../config/logger.js";
import { createSeasonSchema, updateSeasonSchema } from "./seasons.validators.js";

const seasonsService = new SeasonsService();

export const listSeasonsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const seasons = await seasonsService.listSeasons();
    res.status(200).json({
      success: true,
      message: "Seasons retrieved successfully",
      data: seasons,
    });
  } catch (error) {
    logger.error("Error listing seasons:", error);
    next(error);
  }
};

export const getSeasonByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const season = await seasonsService.getSeasonById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Season retrieved successfully",
      data: season,
    });
  } catch (error) {
    logger.error("Error getting season:", error);
    next(error);
  }
};

export const getSeasonsByTvShowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const seasons = await seasonsService.getSeasonsByTvShow(req.params.tvShowId);
    res.status(200).json({
      success: true,
      message: "Seasons retrieved successfully",
      data: seasons,
    });
  } catch (error) {
    logger.error("Error getting seasons by TV show:", error);
    next(error);
  }
};

export const createSeasonController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createSeasonSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const season = await seasonsService.createSeason(value, userId);
    res.status(201).json({
      success: true,
      message: "Season created successfully",
      data: season,
    });
  } catch (error) {
    logger.error("Error creating season:", error);
    next(error);
  }
};

export const updateSeasonController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateSeasonSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const season = await seasonsService.updateSeason(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "Season updated successfully",
      data: season,
    });
  } catch (error) {
    logger.error("Error updating season:", error);
    next(error);
  }
};

export const deleteSeasonController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await seasonsService.deleteSeason(req.params.id);
    res.status(200).json({
      success: true,
      message: "Season deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting season:", error);
    next(error);
  }
};

