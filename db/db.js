import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "../components/Utilities/logger.js";
import clnpjb from "../components/Utilities/clnpjb.js";

clnpjb.start();
logger.info("🚀 Cleanup job scheduled!");

// Load environment variables
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
logger.info(`🌐 Environment: ${env}`);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  logger.error("❌ MongoDB URI not found in environment variables!");
  process.exit(1);
}

// Initialize MongoDB Connection
const initializeDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // These options are recommended for Mongoose 6+
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
    });
    logger.info("✅ MongoDB connected successfully!");
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  logger.info("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  logger.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ Mongoose disconnected from MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed through app termination");
  process.exit(0);
});

initializeDatabase();

export default mongoose;
