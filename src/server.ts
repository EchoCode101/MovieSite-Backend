import http from "http";

import config from "./config/env.js";
import logger from "./config/logger.js";
import { initializeDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { cleanupJobInstance } from "./utils/cleanupJob.js";

async function bootstrap(): Promise<void> {
  await initializeDatabase();

  // Initialize cleanup job (runs in all environments)
  cleanupJobInstance.start();

  const app = createApp();
  const server = http.createServer(app);

  const port = config.port;

  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.warn(`Received ${signal}, shutting down server...`);
    cleanupJobInstance.stop();
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", { reason, promise });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", { error });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to bootstrap server", { error });
  process.exit(1);
});


