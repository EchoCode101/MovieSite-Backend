import fs from "fs";
import sequelize from "./db.js";
import { VideoTags } from "../models/index.js";
import logger from "../components/Utilities/logger.js";
// JSON data file
const jsonDataPath =
  "c:/Users/hamza/OneDrive/Desktop/vidstie/backend/db/data.json";

// Read the JSON file
const importData = async () => {
  try {
    // Connect to the database
    await sequelize.authenticate();

    console.log("✅ Database connected successfully!");

    // Sync the database
    await sequelize.sync(); // Drop and recreate the table
    console.log("✅ Tables created successfully!");

    // Read and parse the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, "utf-8"));

    // Insert the data into the table
    await VideoTags.bulkCreate(jsonData, { validate: true });
    console.log("✅ Data imported successfully!");

    // Close the database connection
    await sequelize.close();
  } catch (error) {
    logger.error("❌ Error importing data:", error);
    console.error("❌ Error importing data:", error);
  }
};

// Run the import function
importData();
