import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "comment_replies",
    {
      reply_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "comments", // Ensure this matches the exact table name
          key: "comment_id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "members", // Ensure this matches the exact table name
          key: "member_id",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      tableName: "comment_replies", // Matches the actual table name in the DB
      timestamps: false,
    }
  );
};
