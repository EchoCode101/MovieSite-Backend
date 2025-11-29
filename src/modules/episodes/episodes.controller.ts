import type { Request, Response, NextFunction } from "express";
import { EpisodesService } from "./episodes.service.js";
import logger from "../../config/logger.js";
import { createEpisodeSchema, updateEpisodeSchema, paginatedEpisodesSchema } from "./episodes.validators.js";

const episodesService = new EpisodesService();

export const listEpisodesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const episodes = await episodesService.listEpisodes();
    res.status(200).json({
      success: true,
      message: "Episodes retrieved successfully",
      data: episodes,
    });
  } catch (error) {
    logger.error("Error listing episodes:", error);
    next(error);
  }
};

export const getPaginatedEpisodesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = paginatedEpisodesSchema.validate(req.query, {
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
    
    // Extract year from query if provided
    const params = {
      ...value,
      year: req.query.year ? Number(req.query.year) : undefined,
    };
    
    const result = await episodesService.getPaginatedEpisodes(params, userId);
    res.status(200).json({
      success: true,
      message: "Episodes retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting paginated episodes:", error);
    next(error);
  }
};

export const getEpisodeByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const episode = await episodesService.getEpisodeById(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "Episode retrieved successfully",
      data: episode,
    });
  } catch (error) {
    logger.error("Error getting episode:", error);
    next(error);
  }
};

export const getEpisodesBySeasonController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const episodes = await episodesService.getEpisodesBySeason(req.params.seasonId, userId);
    res.status(200).json({
      success: true,
      message: "Episodes retrieved successfully",
      data: episodes,
    });
  } catch (error) {
    logger.error("Error getting episodes by season:", error);
    next(error);
  }
};

export const createEpisodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createEpisodeSchema.validate(req.body, {
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

    const episode = await episodesService.createEpisode(value, userId);
    res.status(201).json({
      success: true,
      message: "Episode created successfully",
      data: episode,
    });
  } catch (error) {
    logger.error("Error creating episode:", error);
    next(error);
  }
};

export const updateEpisodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateEpisodeSchema.validate(req.body, {
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

    const episode = await episodesService.updateEpisode(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "Episode updated successfully",
      data: episode,
    });
  } catch (error) {
    logger.error("Error updating episode:", error);
    next(error);
  }
};

export const deleteEpisodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await episodesService.deleteEpisode(req.params.id);
    res.status(200).json({
      success: true,
      message: "Episode deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting episode:", error);
    next(error);
  }
};

