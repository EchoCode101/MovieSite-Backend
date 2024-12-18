import { DataTypes, Sequelize } from "sequelize";

// Define TokenBlacklist Schema
export default (sequelize) => {
  return sequelize.define(
    "token_blacklist",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "token_blacklist",
      timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt` // Explicit table name
    }
  );
};
