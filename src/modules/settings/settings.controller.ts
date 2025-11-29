import type { Request, Response, NextFunction } from "express";
import { SettingsService } from "./settings.service.js";
import logger from "../../config/logger.js";
import { createSettingSchema, updateSettingSchema } from "./settings.validators.js";

const settingsService = new SettingsService();

export const listAllSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const settings = await settingsService.listAllSettings();
    res.status(200).json({
      success: true,
      message: "Settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    logger.error("Error listing settings:", error);
    next(error);
  }
};

export const getSettingByKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const setting = await settingsService.getSettingByKey(req.params.key);
    res.status(200).json({
      success: true,
      message: "Setting retrieved successfully",
      data: setting,
    });
  } catch (error) {
    logger.error("Error getting setting:", error);
    next(error);
  }
};

export const getSettingsByGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const settings = await settingsService.getSettingsByGroup(req.params.group);
    res.status(200).json({
      success: true,
      message: "Settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    logger.error("Error getting settings by group:", error);
    next(error);
  }
};

export const createOrUpdateSettingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createSettingSchema.validate(req.body, {
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

    const setting = await settingsService.createOrUpdateSetting(value);
    res.status(201).json({
      success: true,
      message: "Setting created/updated successfully",
      data: setting,
    });
  } catch (error) {
    logger.error("Error creating/updating setting:", error);
    next(error);
  }
};

export const updateSettingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateSettingSchema.validate(req.body, {
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

    const setting = await settingsService.updateSetting(req.params.key, value);
    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    logger.error("Error updating setting:", error);
    next(error);
  }
};

export const deleteSettingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await settingsService.deleteSetting(req.params.key);
    res.status(200).json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting setting:", error);
    next(error);
  }
};

