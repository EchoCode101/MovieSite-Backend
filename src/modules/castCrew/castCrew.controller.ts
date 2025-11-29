import type { Request, Response, NextFunction } from "express";
import { CastCrewService } from "./castCrew.service.js";
import logger from "../../config/logger.js";
import { createCastCrewSchema, updateCastCrewSchema, listCastCrewQuerySchema } from "./castCrew.validators.js";

const castCrewService = new CastCrewService();

export const listCastCrewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = listCastCrewQuerySchema.validate(req.query, {
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

    const castCrew = await castCrewService.listCastCrew(value);
    res.status(200).json({
      success: true,
      message: "Cast/Crew retrieved successfully",
      data: castCrew,
    });
  } catch (error) {
    logger.error("Error listing cast/crew:", error);
    next(error);
  }
};

export const getCastCrewByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const castCrew = await castCrewService.getCastCrewById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Cast/Crew member retrieved successfully",
      data: castCrew,
    });
  } catch (error) {
    logger.error("Error getting cast/crew:", error);
    next(error);
  }
};

export const createCastCrewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createCastCrewSchema.validate(req.body, {
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

    const castCrew = await castCrewService.createCastCrew(value);
    res.status(201).json({
      success: true,
      message: "Cast/Crew member created successfully",
      data: castCrew,
    });
  } catch (error) {
    logger.error("Error creating cast/crew:", error);
    next(error);
  }
};

export const updateCastCrewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateCastCrewSchema.validate(req.body, {
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

    const castCrew = await castCrewService.updateCastCrew(req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Cast/Crew member updated successfully",
      data: castCrew,
    });
  } catch (error) {
    logger.error("Error updating cast/crew:", error);
    next(error);
  }
};

export const deleteCastCrewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await castCrewService.deleteCastCrew(req.params.id);
    res.status(200).json({
      success: true,
      message: "Cast/Crew member deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting cast/crew:", error);
    next(error);
  }
};

