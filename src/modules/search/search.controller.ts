import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { SearchService } from "./search.service.js";
import logger from "../../config/logger.js";
import type { SearchParams } from "./search.types.js";
import type { ApiResponse } from "../../types/api.types.js";

const searchService = new SearchService();

/**
 * Global search (public - rate limited)
 */
export async function search(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params: SearchParams = {
      q: req.query.q as string,
      type: req.query.type as "all" | "video" | "movie" | "tvshow" | "episode" | "season" | "user" | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await searchService.search(params);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: "Search results retrieved successfully",
      data: result,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    logger.error("Error performing search:", error);
    next(
      err.statusCode
        ? err
        : createError(500, err.message || "Failed to perform search")
    );
  }
}

