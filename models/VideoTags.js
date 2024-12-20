import { DataTypes } from "sequelize";

export default (sequelize) => {
  const VideoTags = sequelize.define("VideoTags", {
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Videos",
        key: "video_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tags",
        key: "tag_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  return VideoTags;
};
