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

  // Define Associations
  LikesDislikes.associate = (models) => {
    LikesDislikes.belongsTo(models.Members, {
      foreignKey: "user_id",
      as: "user",
    });

    LikesDislikes.belongsTo(models.Comments, {
      foreignKey: "target_id",
      constraints: false, // Disable FK constraint since target_id can point to multiple models
      as: "commentTarget",
    });

    LikesDislikes.belongsTo(models.CommentReplies, {
      foreignKey: "target_id",
      constraints: false, // Handle polymorphic relation
      as: "replyTarget",
    });
  };

  return LikesDislikes;
};
