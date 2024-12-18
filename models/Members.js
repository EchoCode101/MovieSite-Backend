import { DataTypes, Sequelize } from "sequelize";
// Define the Members model
export default (sequelize) => {
  return sequelize.define(
    "members",
    {
      member_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subscription_plan: {
        type: DataTypes.STRING,
        defaultValue: "Free",
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
      },
      device_logged_in: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      profile_pic: DataTypes.TEXT,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reviews: DataTypes.JSONB,
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
      date_of_creation: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "date_of_creation", // Map the custom field
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "updated_at", // Map the custom field
      },
    },
    {
      tableName: "members",
      timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt`
    }
  );
};
