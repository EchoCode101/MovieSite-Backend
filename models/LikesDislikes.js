import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LikesDislikes = sequelize.define(
    "LikesDislikes",
    {
      like_dislike_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Members",
          key: "member_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      target_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Can reference Comments or CommentReplies",
      },
      target_type: {
        type: DataTypes.ENUM("comment", "review", "video", "comment_reply"),
        allowNull: false,
        validate: {
          isIn: [["comment", "review", "video", "comment_reply"]],
        },
      },
      is_like: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: "LikesDislikes",
      timestamps: true, // Automatically creates `createdAt` and `updatedAt`
      indexes: [
        {
          name: "likes_dislikes_user_id_target_id_target_type",
          unique: true,
          fields: ["user_id", "target_id", "target_type"],
        },
      ],
    }
  );

  // Define Associations Safely
  LikesDislikes.associate = (models) => {
    LikesDislikes.belongsTo(models.Members, {
      foreignKey: "user_id",
      as: "user",
    });
    LikesDislikes.belongsTo(models.Comments, {
      foreignKey: "target_id",
      constraints: false,
      scope: { target_type: "comment" },
      as: "comment",
    });
    LikesDislikes.belongsTo(models.Videos, {
      foreignKey: "target_id",
      constraints: false,
      scope: { target_type: "video" },
      as: "video",
    });
  };

  return LikesDislikes;
};
