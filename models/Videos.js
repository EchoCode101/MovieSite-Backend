import { DataTypes } from "sequelize";
// Define Videos Model
export default (sequelize) => {
  return sequelize.define(
    "videos",
    {
      video_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      video_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      duration: DataTypes.INTEGER,
      resolution: DataTypes.STRING(20),
      file_size: DataTypes.BIGINT,
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      video_url_encrypted: DataTypes.TEXT,
      access_level: {
        type: DataTypes.STRING(50),
        defaultValue: "Free",
      },
      category: DataTypes.STRING(100),
      tags: DataTypes.ARRAY(DataTypes.TEXT),
      language: DataTypes.STRING(50),
      thumbnail_url: DataTypes.TEXT,
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      dislikes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      favorites_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      shares_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      uploader_id: DataTypes.INTEGER,
      uploader_name: DataTypes.STRING(100),
      rating: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      age_restriction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      video_format: DataTypes.STRING(50),
      license_type: DataTypes.STRING(100),
      published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      report_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      subtitle_languages: DataTypes.ARRAY(DataTypes.TEXT),
      average_watch_time: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      video_quality: DataTypes.ARRAY(DataTypes.TEXT),
      geo_restrictions: DataTypes.ARRAY(DataTypes.TEXT),
      content_type: DataTypes.STRING(50),
      seo_title: DataTypes.STRING(255),
      seo_description: DataTypes.TEXT,
      custom_metadata: DataTypes.JSONB,
      review_counts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "videos",
      timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt` // Explicit table name
    }
  );
};
