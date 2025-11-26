import cron from "node-cron";
import { TokenBlacklistModel, PasswordResets } from "../models/index.js";
import logger from "../config/logger.js";

export interface CleanupJob {
  start: () => void;
  stop: () => void;
}

// Scheduled job to clean up expired tokens and password resets
const cleanupJob = cron.schedule("0 * * * *", async () => {
  logger.info("🕒 Starting cleanup job...");

  try {
    // Delete expired tokens using Mongoose
    const deletedTokens = await TokenBlacklistModel.deleteMany({
      expires_at: { $lt: new Date() },
    });

    // Delete expired password resets using Mongoose
    const deletedResets = await PasswordResets.deleteMany({
      reset_token_expiration: { $lt: new Date() },
    });

    logger.info(
      `🧹 Cleanup completed: ${deletedTokens.deletedCount} token(s) removed from token_blacklist`,
    );
    logger.info(
      `🧹 Cleanup completed: ${deletedResets.deletedCount} record(s) removed from password_resets`,
    );
  } catch (err) {
    logger.error("❌ Cleanup job failed:", err);
  }
});

export const cleanupJobInstance: CleanupJob = {
  start: () => {
    cleanupJob.start();
    logger.info("✅ Cleanup job started");
  },
  stop: () => {
    cleanupJob.stop();
    logger.info("🛑 Cleanup job stopped");
  },
};

