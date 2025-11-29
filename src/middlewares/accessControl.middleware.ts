import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { checkContentAccess } from "../utils/accessControl.js";
import { MovieModel } from "../models/movie.model.js";
import { EpisodeModel } from "../models/episode.model.js";
import { TvShowModel } from "../models/tvShow.model.js";

/**
 * Middleware to check if user has access to content before allowing request
 * Expects target_type and target_id in req.params or req.body
 */
export async function checkContentAccessMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetType = (req.params.targetType || req.body.target_type) as
      | "movie"
      | "tvshow"
      | "episode"
      | undefined;
    const targetId = (req.params.targetId || req.body.target_id) as string | undefined;

    if (!targetType || !targetId) {
      return next(createError(400, "target_type and target_id are required"));
    }

    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;

    // Get content and check access
    let accessType: "free" | "subscription" | "pay_per_view";
    let planIds: any[] = [];

    if (targetType === "movie") {
      const movie = await MovieModel.findById(targetId);
      if (!movie) {
        return next(createError(404, "Movie not found"));
      }
      accessType = movie.access_type;
      planIds = movie.plan_ids;
    } else if (targetType === "tvshow") {
      const tvShow = await TvShowModel.findById(targetId);
      if (!tvShow) {
        return next(createError(404, "TV Show not found"));
      }
      accessType = tvShow.access_type;
      planIds = tvShow.plan_ids;
    } else if (targetType === "episode") {
      const episode = await EpisodeModel.findById(targetId);
      if (!episode) {
        return next(createError(404, "Episode not found"));
      }
      accessType = episode.access_type;
      planIds = episode.plan_ids;
    } else {
      return next(createError(400, "Invalid target_type"));
    }

    const hasAccess = await checkContentAccess(
      userId,
      accessType,
      planIds,
      targetType,
      targetId,
    );

    if (!hasAccess) {
      return next(
        createError(403, `You do not have access to this ${targetType}. Please subscribe or purchase.`),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check device limit before registration
 * Expects user to be authenticated
 */
export async function checkDeviceLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;

    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    // Device limit check is handled in the DevicesService
    // This middleware can be used for additional validation if needed
    next();
  } catch (error) {
    next(error);
  }
}

