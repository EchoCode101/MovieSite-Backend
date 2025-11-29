import type { CorsOptions } from "cors";
import config from "./env.js";
import logger from "./logger.js";

export function getCorsOptions(): CorsOptions {
  const allowedOrigins = [config.originMain, config.originAdmin, config.originVia].filter(Boolean);

  // Log allowed origins on startup
  logger.info("CORS Configuration", {
    allowedOrigins,
    mainOrigin: config.originMain,
    adminOrigin: config.originAdmin,
    viaOrigin: config.originVia,
  });

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.) in development
      if (!origin) {
        if (config.nodeEnv === "development") {
          return callback(null, true);
        }
        return callback(new Error("Origin header is required"));
      }

      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn("CORS blocked request", {
          requestedOrigin: origin,
          allowedOrigins,
        });
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  };
}


