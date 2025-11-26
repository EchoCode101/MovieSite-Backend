import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import multer from "multer";

import { getCorsOptions } from "./config/cors.js";
import logger from "./config/logger.js";
import apiRouter from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(cors(getCorsOptions()));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'", "https://api.cloudinary.com", "https://www.gstatic.com"],
          "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
          "connect-src": ["'self'", "https://api.cloudinary.com"],
        },
      },
    }),
  );

  // Central API router (mirrors backend/index.js paths)
  app.use("/api", apiRouter);

  app.get("/test", (_req: Request, res: Response) => {
    res.send("Hello from Express!");
  });

  app.get("/error", (_req: Request, _res: Response, next: NextFunction) => {
    const err = new Error("Sample error occurred!") as Error & { statusCode?: number };
    err.statusCode = 400;
    next(err);
  });

  // Multer-specific error handling (before global error handler)
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds the limit of 100 MB.",
        });
      }

      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    next(err);
  });

  // Global error handler (reuses existing JS middleware)
  app.use(errorHandler);

  // Basic health log on app creation
  logger.info("Express app created (TS entrypoint)");

  return app;
}


