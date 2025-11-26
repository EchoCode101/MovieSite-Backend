import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";
import config from "../config/env.js";

interface ErrorWithStatusCode extends Error {
    statusCode?: number;
    status?: number;
}

/**
 * Global error handling middleware
 * Logs errors and returns standardized error responses
 */
const errorHandler = (
    err: ErrorWithStatusCode,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // http-errors uses 'status', Express uses 'statusCode' - check both
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    // Log the error details
    const errorDetails = {
        method: req.method,
        url: req.originalUrl,
        status: statusCode,
        message,
        stack: config.nodeEnv === "development" ? err.stack : "Hidden",
        ...(req.body && { requestBody: req.body }),
    };

    // Log the error using Winston
    logger.error(JSON.stringify(errorDetails, null, 2));

    // Send a proper JSON response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(config.nodeEnv === "development" && { stack: err.stack }),
        },
    });
};

export default errorHandler;

