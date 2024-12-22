import { DataTypes } from "sequelize";
export default (sequelize) => {
  const Comments = sequelize.define(
    "Comments",
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
          model: "Members",
          key: "member_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Videos",
          key: "video_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "Comments",
      timestamps: true, // Adds `createdAt` and `updatedAt`
    }
  );
  // Model Associations
  Comments.associate = (models) => {
    Comments.belongsTo(models.Members, {
      foreignKey: "member_id",
      as: "member",
    });

    Comments.belongsTo(models.Videos, {
      foreignKey: "video_id",
      as: "video",
    });

    Comments.hasMany(models.CommentReplies, {
      foreignKey: "comment_id",
      as: "replies",
    });

    Comments.hasMany(models.LikesDislikes, {
      foreignKey: "target_id",
      as: "likesDislikes",
      scope: { target_type: "comment" },
    });
  };

  return Comments;
};
