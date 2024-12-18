import { DataTypes, Sequelize } from "sequelize";
export default (sequelize) => {
  return sequelize.define(
    "comments",
    {
      comment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "members", // Refers to the Members table
          key: "member_id",
        },
        onDelete: "CASCADE",
      },
      video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "videos", // Refers to the Videos table
          key: "video_id",
        },
        onDelete: "CASCADE",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "comments",
      timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt`
    }
  );
};
