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
      through: models.VideoTags, // Correctly reference the through model
      foreignKey: "video_id",
      otherKey: "tag_id",
      as: "tags",
    });
    Videos.hasMany(models.ReviewsAndRatings, {
      foreignKey: "video_id",
      as: "reviews",
    });

    Videos.hasMany(models.Comments, {
      foreignKey: "video_id",
      as: "comments",
    });
    // Correctly associate VideoMetrics
    Videos.hasOne(models.VideoMetrics, {
      foreignKey: "video_id",
      as: "metrics", // Alias must match the include in controller
    });

    Videos.hasMany(models.LikesDislikes, {
      foreignKey: "target_id",
      constraints: false,
      scope: { target_type: "video" },
      as: "likesDislikes",
    });
  };

  return Videos;
};
