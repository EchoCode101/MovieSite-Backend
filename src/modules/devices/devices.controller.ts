import type { Request, Response, NextFunction } from "express";
import { DevicesService } from "./devices.service.js";
import logger from "../../config/logger.js";
import { createDeviceSchema, updateDeviceSchema } from "./devices.validators.js";

const devicesService = new DevicesService();

export const listDevicesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const devices = await devicesService.listDevices(userId);
    res.status(200).json({
      success: true,
      message: "Devices retrieved successfully",
      data: devices,
    });
  } catch (error) {
    logger.error("Error listing devices:", error);
    next(error);
  }
};

export const getDeviceByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const device = await devicesService.getDeviceById(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "Device retrieved successfully",
      data: device,
    });
  } catch (error) {
    logger.error("Error getting device:", error);
    next(error);
  }
};

export const checkDeviceLimitController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const limitCheck = await devicesService.checkDeviceLimit(userId);
    res.status(200).json({
      success: true,
      message: "Device limit check completed",
      data: limitCheck,
    });
  } catch (error) {
    logger.error("Error checking device limit:", error);
    next(error);
  }
};

export const registerDeviceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createDeviceSchema.validate(req.body, {
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

    const device = await devicesService.registerDevice(value, userId);
    res.status(201).json({
      success: true,
      message: "Device registered successfully",
      data: device,
    });
  } catch (error) {
    logger.error("Error registering device:", error);
    next(error);
  }
};

export const updateDeviceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateDeviceSchema.validate(req.body, {
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

    const device = await devicesService.updateDevice(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "Device updated successfully",
      data: device,
    });
  } catch (error) {
    logger.error("Error updating device:", error);
    next(error);
  }
};

export const deleteDeviceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    await devicesService.deleteDevice(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "Device removed successfully",
    });
  } catch (error) {
    logger.error("Error deleting device:", error);
    next(error);
  }
};

