import { DataTypes } from "sequelize";

export default (sequelize) => {
  const CommentReplies = sequelize.define(
    "CommentReplies",
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
          model: "Comments",
          key: "comment_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Members",
          key: "member_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reply_content: {
        type: DataTypes.TEXT,
        allowNull: false, // Replies must have content
      },
    },
    {
      tableName: "CommentReplies",
      timestamps: true, // Automatically creates `createdAt` and `updatedAt`
    }
  );

  CommentReplies.associate = (models) => {
    CommentReplies.belongsTo(models.Comments, {
      foreignKey: "comment_id",
      as: "comment",
    });
    CommentReplies.belongsTo(models.Members, {
      foreignKey: "member_id",
      as: "member",
    });
    if (models.LikesDislikes) {
      CommentReplies.hasMany(models.LikesDislikes, {
        foreignKey: "target_id",
        as: "likesDislikes",
        scope: { target_type: "comment_reply" },
      });
    }
  };

  return CommentReplies;
};
