import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Videos = sequelize.define(
    "Videos",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      video_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resolution: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      video_url_encrypted: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      access_level: {
        type: DataTypes.STRING(50),
        defaultValue: "Free",
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      age_restriction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      video_format: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      license_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      seo_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      seo_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      custom_metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "Videos",
      timestamps: true, // Sequelize will handle createdAt & updatedAt
    }
  );
  Videos.associate = (models) => {
    Videos.belongsToMany(models.Tags, {
      through: VideoTags,
      foreignKey: "video_id",
      as: "tags",
    });
    // Video Associations
    Videos.hasMany(models.Reviews, {
      foreignKey: "video_id",
      as: "videoReviews",
    });

    Videos.hasMany(models.Comments, {
      foreignKey: "video_id",
      as: "videoComments",
    });
  };
  return Videos;
};
