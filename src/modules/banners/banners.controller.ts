import type { Request, Response, NextFunction } from "express";
import { BannersService } from "./banners.service.js";
import logger from "../../config/logger.js";
import { createBannerSchema, updateBannerSchema, listBannersQuerySchema } from "./banners.validators.js";

const bannersService = new BannersService();

export const listActiveBannersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = listBannersQuerySchema.validate(req.query, {
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

    const banners = await bannersService.listActiveBanners(value);
    res.status(200).json({
      success: true,
      message: "Banners retrieved successfully",
      data: banners,
    });
  } catch (error) {
    logger.error("Error listing banners:", error);
    next(error);
  }
};

export const getAllBannersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const banners = await bannersService.listAllBanners();
    res.status(200).json({
      success: true,
      message: "Banners retrieved successfully",
      data: banners,
    });
  } catch (error) {
    logger.error("Error getting all banners:", error);
    next(error);
  }
};

export const getBannerByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const banner = await bannersService.getBannerById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Banner retrieved successfully",
      data: banner,
    });
  } catch (error) {
    logger.error("Error getting banner:", error);
    next(error);
  }
};

export const createBannerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createBannerSchema.validate(req.body, {
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

    const banner = await bannersService.createBanner(value, userId);
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    logger.error("Error creating banner:", error);
    next(error);
  }
};

export const updateBannerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateBannerSchema.validate(req.body, {
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

    const banner = await bannersService.updateBanner(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    logger.error("Error updating banner:", error);
    next(error);
  }
};

export const deleteBannerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await bannersService.deleteBanner(req.params.id);
    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting banner:", error);
    next(error);
  }
};

