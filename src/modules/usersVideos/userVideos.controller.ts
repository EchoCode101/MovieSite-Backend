import type { Request, Response, NextFunction } from "express";
import { UserVideosService } from "./userVideos.service.js";
import logger from "../../config/logger.js";

const userVideosService = new UserVideosService();

export const saveUserVideoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { video_url, title } = req.body as { video_url?: string; title?: string };

    const result = await userVideosService.addVideoForUser(userId, video_url ?? "", title ?? "");

    res.status(201).json({
      success: true,
      message: "Video added successfully!",
      data: result,
    });
  } catch (error) {
    logger.error("Error adding video (TS controller):", error);
    next(error);
  }
};

export const getUserVideosController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const result = await userVideosService.getUserVideos(userId, page, limit);

    res.status(200).json({
      success: true,
      message: "User videos retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching user videos (TS controller):", error);
    next(error);
  }
};

export const deleteUserVideoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params as { id: string };

    await userVideosService.deleteUserVideo(userId, id);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting video (TS controller):", error);
    next(error);
  }
};

export const fetchVideoUrlController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { video_id } = req.params as { video_id: string };

    const result = await userVideosService.fetchVideoUrl(video_id);

    res.status(200).json({
      success: true,
      message: "Video fetched successfully!",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching video (TS controller):", error);
    next(error);
  }
};


