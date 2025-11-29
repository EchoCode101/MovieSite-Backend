import type { Request, Response, NextFunction } from "express";
import { MoviesService } from "./movies.service.js";
import logger from "../../config/logger.js";
import { createMovieSchema, updateMovieSchema, paginatedMoviesSchema } from "./movies.validators.js";

const moviesService = new MoviesService();

export const getAllMoviesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const movies = await moviesService.getAllMovies();
    res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      data: movies,
    });
  } catch (error) {
    logger.error("Error getting all movies:", error);
    next(error);
  }
};

export const getMovieByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const movie = await moviesService.getMovieById(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "Movie retrieved successfully",
      data: movie,
    });
  } catch (error) {
    logger.error("Error getting movie:", error);
    next(error);
  }
};

export const getPaginatedMoviesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = paginatedMoviesSchema.validate(req.query, {
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
    
    const result = await moviesService.getPaginatedMovies(params, userId);
    res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting paginated movies:", error);
    next(error);
  }
};

export const getTrendingMoviesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const movies = await moviesService.getTrendingMovies(userId);
    res.status(200).json({
      success: true,
      message: "Trending movies retrieved successfully",
      data: movies,
    });
  } catch (error) {
    logger.error("Error getting trending movies:", error);
    next(error);
  }
};

export const getFeaturedMoviesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const movies = await moviesService.getFeaturedMovies(userId);
    res.status(200).json({
      success: true,
      message: "Featured movies retrieved successfully",
      data: movies,
    });
  } catch (error) {
    logger.error("Error getting featured movies:", error);
    next(error);
  }
};

export const getComingSoonMoviesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const movies = await moviesService.getComingSoonMovies();
    res.status(200).json({
      success: true,
      message: "Coming soon movies retrieved successfully",
      data: movies,
    });
  } catch (error) {
    logger.error("Error getting coming soon movies:", error);
    next(error);
  }
};

export const createMovieController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createMovieSchema.validate(req.body, {
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
        error: {
          message: "Unauthorized",
        },
      });
      return;
    }

    const movie = await moviesService.createMovie(value, userId);
    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (error) {
    logger.error("Error creating movie:", error);
    next(error);
  }
};

export const updateMovieController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateMovieSchema.validate(req.body, {
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
        error: {
          message: "Unauthorized",
        },
      });
      return;
    }

    const movie = await moviesService.updateMovie(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: movie,
    });
  } catch (error) {
    logger.error("Error updating movie:", error);
    next(error);
  }
};

export const deleteMovieController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await moviesService.deleteMovie(req.params.id);
    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting movie:", error);
    next(error);
  }
};

