import { DataTypes, Sequelize } from "sequelize";

// Define the PasswordResets model
export default (sequelize) => {
  return sequelize.define(
    "password_resets",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reset_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reset_token_expiration: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      user_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "password_resets",
      timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt` // Explicit table name
    }
  );
};
