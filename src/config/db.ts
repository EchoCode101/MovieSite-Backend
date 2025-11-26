import mongoose from "mongoose";
import logger from "./logger.js";
import config from "./env.js";

let initialized = false;

export async function initializeDatabase(): Promise<void> {
  if (initialized) {
    return;
  }

  const mongoUri = config.mongoUri;

  try {
    await mongoose.connect(mongoUri);
    initialized = true;
    logger.info("✅ MongoDB connected successfully (TS db bootstrap)");

    mongoose.connection.on("connected", () => {
      logger.info("✅ Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("❌ Mongoose connection error:", { err });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ Mongoose disconnected from MongoDB");
    });
  } catch (error) {
    logger.error("❌ MongoDB connection failed", { error });
    throw error;
  }
}

export default mongoose;


