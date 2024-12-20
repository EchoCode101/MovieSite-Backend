import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ReviewsAndRatings = sequelize.define(
    "ReviewsAndRatings",
    {
      review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10, // Ensure rating is between 1 and 10
          isInt: true,
        },
      },
      review_content: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional content
      },
    },
    {
      tableName: "ReviewsAndRatings",
      timestamps: true, // Manages `createdAt` and `updatedAt`
    }
  );

  // Define Model Associations
  ReviewsAndRatings.associate = (models) => {
    ReviewsAndRatings.belongsTo(models.Videos, {
      foreignKey: "video_id",
      as: "video",
    });

    ReviewsAndRatings.belongsTo(models.Members, {
      foreignKey: "member_id",
      as: "member",
    });
  };

  return ReviewsAndRatings;
};
