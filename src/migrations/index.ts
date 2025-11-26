import logger from "../config/logger.js";

// Simple placeholder for future versioned migrations.
// You can add files like src/migrations/001-add-isDeleted-to-videos.ts
// and import/run them from here in order.

export async function runMigrations(): Promise<void> {
  logger.info("No migrations to run yet. Migration system is initialized.");
}


