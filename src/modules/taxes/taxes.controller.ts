import type { Request, Response, NextFunction } from "express";
import { TaxesService } from "./taxes.service.js";
import logger from "../../config/logger.js";
import { createTaxSchema, updateTaxSchema } from "./taxes.validators.js";

const taxesService = new TaxesService();

export const listTaxesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taxes = await taxesService.listTaxes();
    res.status(200).json({
      success: true,
      message: "Taxes retrieved successfully",
      data: taxes,
    });
  } catch (error) {
    logger.error("Error listing taxes:", error);
    next(error);
  }
};

export const getTaxByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tax = await taxesService.getTaxById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Tax retrieved successfully",
      data: tax,
    });
  } catch (error) {
    logger.error("Error getting tax:", error);
    next(error);
  }
};

export const getTaxByCountryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tax = await taxesService.getTaxByCountry(req.params.country);
    res.status(200).json({
      success: true,
      message: tax ? "Tax retrieved successfully" : "No tax found for this country",
      data: tax,
    });
  } catch (error) {
    logger.error("Error getting tax by country:", error);
    next(error);
  }
};

export const createTaxController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createTaxSchema.validate(req.body, {
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

    const tax = await taxesService.createTax(value);
    res.status(201).json({
      success: true,
      message: "Tax created successfully",
      data: tax,
    });
  } catch (error) {
    logger.error("Error creating tax:", error);
    next(error);
  }
};

export const updateTaxController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateTaxSchema.validate(req.body, {
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

    const tax = await taxesService.updateTax(req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Tax updated successfully",
      data: tax,
    });
  } catch (error) {
    logger.error("Error updating tax:", error);
    next(error);
  }
};

export const deleteTaxController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await taxesService.deleteTax(req.params.id);
    res.status(200).json({
      success: true,
      message: "Tax deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting tax:", error);
    next(error);
  }
};

