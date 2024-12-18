import { DataTypes } from "sequelize";
import { Videos, Members } from "./index.js";
export default (sequelize) => {
  return sequelize.define(
    "reviews",
    {
      review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Videos, // Model reference
          key: "video_id",
        },
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Members, // Model reference
          key: "member_id",
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        validate: { min: 0, max: 10 },
      },
      content: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "reviews",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
