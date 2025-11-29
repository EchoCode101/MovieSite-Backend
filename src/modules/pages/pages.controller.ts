import type { Request, Response, NextFunction } from "express";
import { PagesService } from "./pages.service.js";
import logger from "../../config/logger.js";
import { createPageSchema, updatePageSchema } from "./pages.validators.js";

const pagesService = new PagesService();

export const listActivePagesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pages = await pagesService.listActivePages();
    res.status(200).json({
      success: true,
      message: "Pages retrieved successfully",
      data: pages,
    });
  } catch (error) {
    logger.error("Error listing pages:", error);
    next(error);
  }
};

export const getAllPagesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pages = await pagesService.listAllPages();
    res.status(200).json({
      success: true,
      message: "Pages retrieved successfully",
      data: pages,
    });
  } catch (error) {
    logger.error("Error getting all pages:", error);
    next(error);
  }
};

export const getPageBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = await pagesService.getPageBySlug(req.params.slug);
    res.status(200).json({
      success: true,
      message: "Page retrieved successfully",
      data: page,
    });
  } catch (error) {
    logger.error("Error getting page:", error);
    next(error);
  }
};

export const createPageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createPageSchema.validate(req.body, {
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

    const page = await pagesService.createPage(value);
    res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: page,
    });
  } catch (error) {
    logger.error("Error creating page:", error);
    next(error);
  }
};

export const updatePageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updatePageSchema.validate(req.body, {
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

    const page = await pagesService.updatePage(req.params.slug, value);
    res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    logger.error("Error updating page:", error);
    next(error);
  }
};

export const deletePageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await pagesService.deletePage(req.params.slug);
    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting page:", error);
    next(error);
  }
};

