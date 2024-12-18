import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "likes_dislikes",
    {
      like_dislike_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      target_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      target_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: {
            args: [["comment", "review", "comment_reply", "video"]],
            msg: "Invalid target type",
          },
        },
      },
      is_like: {
        type: DataTypes.BOOLEAN,
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
      tableName: "likes_dislikes",
      timestamps: true,
      updatedAt: "updated_at",
      createdAt: "created_at",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "target_id", "target_type"],
        },
      ],
    }
  );
};
