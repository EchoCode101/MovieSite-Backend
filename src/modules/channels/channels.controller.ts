import type { Request, Response, NextFunction } from "express";
import { ChannelsService } from "./channels.service.js";
import logger from "../../config/logger.js";
import { createChannelSchema, updateChannelSchema } from "./channels.validators.js";

const channelsService = new ChannelsService();

export const listActiveChannelsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const channels = await channelsService.listActiveChannels();
    res.status(200).json({
      success: true,
      message: "Channels retrieved successfully",
      data: channels,
    });
  } catch (error) {
    logger.error("Error listing channels:", error);
    next(error);
  }
};

export const getAllChannelsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const channels = await channelsService.listAllChannels();
    res.status(200).json({
      success: true,
      message: "Channels retrieved successfully",
      data: channels,
    });
  } catch (error) {
    logger.error("Error getting all channels:", error);
    next(error);
  }
};

export const getChannelByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const channel = await channelsService.getChannelById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Channel retrieved successfully",
      data: channel,
    });
  } catch (error) {
    logger.error("Error getting channel:", error);
    next(error);
  }
};

export const createChannelController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createChannelSchema.validate(req.body, {
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

    const channel = await channelsService.createChannel(value, userId);
    res.status(201).json({
      success: true,
      message: "Channel created successfully",
      data: channel,
    });
  } catch (error) {
    logger.error("Error creating channel:", error);
    next(error);
  }
};

export const updateChannelController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateChannelSchema.validate(req.body, {
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

    const channel = await channelsService.updateChannel(req.params.id, value, userId);
    res.status(200).json({
      success: true,
      message: "Channel updated successfully",
      data: channel,
    });
  } catch (error) {
    logger.error("Error updating channel:", error);
    next(error);
  }
};

export const deleteChannelController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await channelsService.deleteChannel(req.params.id);
    res.status(200).json({
      success: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting channel:", error);
    next(error);
  }
};

