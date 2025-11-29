import type { Request, Response, NextFunction } from "express";
import { GenresService } from "./genres.service.js";
import logger from "../../config/logger.js";
import { createGenreSchema, updateGenreSchema } from "./genres.validators.js";

const genresService = new GenresService();

export const listGenresController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const genres = await genresService.listGenres();
    res.status(200).json({
      success: true,
      message: "Genres retrieved successfully",
      data: genres,
    });
  } catch (error) {
    logger.error("Error listing genres:", error);
    next(error);
  }
};

export const getGenreByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const genre = await genresService.getGenreById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Genre retrieved successfully",
      data: genre,
    });
  } catch (error) {
    logger.error("Error getting genre:", error);
    next(error);
  }
};

export const createGenreController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createGenreSchema.validate(req.body, {
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

    const genre = await genresService.createGenre(value);
    res.status(201).json({
      success: true,
      message: "Genre created successfully",
      data: genre,
    });
  } catch (error) {
    logger.error("Error creating genre:", error);
    next(error);
  }
};

export const updateGenreController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateGenreSchema.validate(req.body, {
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

    const genre = await genresService.updateGenre(req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Genre updated successfully",
      data: genre,
    });
  } catch (error) {
    logger.error("Error updating genre:", error);
    next(error);
  }
};

export const deleteGenreController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await genresService.deleteGenre(req.params.id);
    res.status(200).json({
      success: true,
      message: "Genre deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting genre:", error);
    next(error);
  }
};

