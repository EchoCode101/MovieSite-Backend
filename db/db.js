import dotenv from "dotenv";
import logger from "../components/Utilities/logger.js";
import { Sequelize } from "sequelize";
import clnpjb from "../components/Utilities/clnpjb.js";
clnpjb.start();
console.log("🚀 Cleanup job scheduled!");
// Load environment variables
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
logger.info(`🌐 Environment: ${env}`);

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Use debug for SQL queries
});

// Test Database Connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected successfully!");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
  }
};

initializeDatabase();

export default sequelize;
