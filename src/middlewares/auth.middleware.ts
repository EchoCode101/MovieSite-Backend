import rateLimit from "express-rate-limit";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";

import { verifyAccessToken } from "../utils/jwt.js";
import { extractAndDecryptToken } from "../utils/helpers.js";
import logger from "../config/logger.js";

import type { JwtUserPayload } from "../modules/auth/auth.types.js";
import config from "../config/env.js";

const authenticateToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);
    // logger.debug("Decrypted token extracted successfully", {
    //   tokenLength: decryptedToken?.length,
    //   path: req.path
    // });

    const verifiedToken = verifyAccessToken(decryptedToken);
    req.user = verifiedToken;
    next();
  } catch (error: any) {
    logger.error("Error in authentication of Token middleware (TS):", {
      error: error?.message || error,
      status: error?.status || error?.statusCode,
      path: req.path,
      hasAuthHeader: !!req.headers.authorization,
      hasCookie: !!req.cookies?.encryptedAccessToken,
    });

    // If error already has a status (from createError), pass it through
    // Use 401 (Unauthorized) instead of 403 (Forbidden) for auth failures
    if (error?.status || error?.statusCode) {
      return next(error);
    }

    // Check if it's a decryption error
    if (error?.message?.includes("Invalid encrypted text format") ||
      error?.message?.includes("decrypt")) {
      return next(createError(401, "Invalid token format"));
    }

    return next(createError(401, "Invalid token format or verification failed"));
  }
};

const authenticateAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);

    const verified = jwt.verify(
      decryptedToken,
      config.jwtSecret,
    ) as JwtUserPayload;

    if (verified.role !== "admin") {
      return res.status(403).send("Access denied: Admins only");
    }

    req.user = verified;
    next();
  } catch (error: any) {
    logger.error("Error in authentication of Admin Token middleware (TS):", error);
    next(
      error?.status
        ? error
        : createError(403, "Invalid token format or verification failed"),
    );
  }
};

// User-specific rate limiter (same behavior as legacy)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  keyGenerator: (req: Request): string => {
    const fromUser = (req.user?.id as string | undefined) ?? (req.user?.email as string | undefined);
    return (fromUser || req.ip) as string;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Optional authentication middleware - sets req.user if token is valid,
 * but doesn't fail if token is missing or invalid (for public routes)
 * This allows public routes to work with or without authentication
 */
const optionalAuthenticateToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // extractAndDecryptToken throws if token is missing, so we catch that
    const decryptedToken = await extractAndDecryptToken(req);
    
    if (!decryptedToken) {
      // No token provided - continue as anonymous user
      return next();
    }

    const verifiedToken = verifyAccessToken(decryptedToken);
    req.user = verifiedToken;
    next();
  } catch (error: any) {
    // Token is invalid, missing, or expired - continue as anonymous user (don't fail)
    // This allows public routes to work with or without authentication
    // Only log in development to avoid noise in production
    if (config.nodeEnv === "development") {
      logger.debug("Optional auth: Token invalid or missing, continuing as anonymous", {
        path: req.path,
        error: error?.message,
        hasAuthHeader: !!req.headers.authorization,
        hasCookie: !!req.cookies?.encryptedAccessToken,
      });
    }
    next();
  }
};

export { authenticateToken, authenticateAdminToken, optionalAuthenticateToken, limiter };


