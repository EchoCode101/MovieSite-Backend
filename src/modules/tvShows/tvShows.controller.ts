import type { Request, Response, NextFunction } from "express";
import { TvShowsService } from "./tvShows.service.js";
import logger from "../../config/logger.js";
import { createTvShowSchema, updateTvShowSchema, paginatedTvShowsSchema } from "./tvShows.validators.js";

const tvShowsService = new TvShowsService();

export const getAllTvShowsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tvShows = await tvShowsService.getAllTvShows();
    res.status(200).json({
      success: true,
      message: "TV Shows retrieved successfully",
      data: tvShows,
    });
  } catch (error) {
    logger.error("Error getting all TV shows:", error);
    next(error);
  }
};

export const getTvShowByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const tvShow = await tvShowsService.getTvShowById(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "TV Show retrieved successfully",
      data: tvShow,
    });
  } catch (error) {
    logger.error("Error getting TV show:", error);
    next(error);
  }
};

export const getPaginatedTvShowsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = paginatedTvShowsSchema.validate(req.query, {
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
    
    const result = await tvShowsService.getPaginatedTvShows(params, userId);
    res.status(200).json({
      success: true,
      message: "TV Shows retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting paginated TV shows:", error);
    next(error);
  }
};

export const getTvShowSeasonsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const seasons = await tvShowsService.getTvShowSeasons(req.params.id);
    res.status(200).json({
      success: true,
      message: "Seasons retrieved successfully",
      data: seasons,
    });
  } catch (error) {
    logger.error("Error getting TV show seasons:", error);
    next(error);
  }
};

export const createTvShowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createTvShowSchema.validate(req.body, {
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

    const tvShow = await tvShowsService.createTvShow(value, userId);
    res.status(201).json({
      success: true,
      message: "TV Show created successfully",
      data: tvShow,
    });
  } catch (error) {
    logger.error("Error creating TV show:", error);
    next(error);
  }
};

export const updateTvShowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateTvShowSchema.validate(req.body, {
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

    const tvShow = await tvShowsService.updateTvShow(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "TV Show updated successfully",
      data: tvShow,
    });
  } catch (error) {
    logger.error("Error updating TV show:", error);
    next(error);
  }
};

export const deleteTvShowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await tvShowsService.deleteTvShow(req.params.id);
    res.status(200).json({
      success: true,
      message: "TV Show deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting TV show:", error);
    next(error);
  }
};

