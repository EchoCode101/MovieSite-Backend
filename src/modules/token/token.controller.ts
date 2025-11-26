import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { TokenService } from "./token.service.js";
import logger from "../../config/logger.js";

const tokenService = new TokenService();

/**
 * Refresh access token (public - uses refresh token from cookie)
 */
export async function refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await tokenService.refreshToken(req);
        res.json(result);
    } catch (error: unknown) {
        const err = error as Error & { status?: number };
        logger.error("Error in refresh token logic:", error);
        next(
            err.status
                ? err
                : createError(403, "Invalid token format or verification failed")
        );
    }
}

/**
 * Validate access token (authenticated)
 */
export async function validateToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await tokenService.validateToken(req);
        res.json(result);
    } catch (error: unknown) {
        const err = error as Error & { status?: number };
        logger.error("Error in validateToken middleware:", error);
        next(
            err.status
                ? err
                : createError(403, "Invalid token format or verification failed")
        );
    }
}

