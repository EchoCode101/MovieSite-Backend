import { DataTypes } from "sequelize";

export default (sequelize) => {
  const VideoMetrics = sequelize.define("VideoMetrics", {
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Videos",
        key: "video_id",
      },
      primaryKey: true,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shares_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    favorites_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    report_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  VideoMetrics.associate = (models) => {
    VideoMetrics.belongsTo(models.Videos, {
      foreignKey: "video_id",
      as: "video",
    });
  };
  return VideoMetrics;
};
