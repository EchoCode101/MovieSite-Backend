import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Members = sequelize.define(
    "Members",
    {
      member_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Ensures username is unique
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Ensures email uniqueness
        validate: {
          isEmail: true, // Email format validation
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subscription_plan: {
        type: DataTypes.STRING(255),
        defaultValue: "Free", // Default subscription
      },
      role: {
        type: DataTypes.STRING(255),
        defaultValue: "user", // Default role
      },
      profile_pic: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional profile picture
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true, // Not required on registration
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true, // Not required on registration
      },
      status: {
        type: DataTypes.STRING(255),
        defaultValue: "Active", // Default active status
      },
      lastLogin: {
        type: DataTypes.DATE, // Track last login date
        allowNull: true,
      },
    },
    {
      tableName: "Members",
      timestamps: true, // Adds createdAt & updatedAt
      indexes: [
        {
          name: "email_idx",
          unique: true,
          fields: ["email"], // Create index on email
        },
      ],
    }
  );
  Members.associate = (models) => {
    Members.hasMany(models.ReviewsAndRatings, {
      foreignKey: "member_id",
      as: "memberReviews",
    });
    Members.hasMany(models.Comments, {
      foreignKey: "member_id",
      as: "memberComments",
    });
    Members.hasMany(models.CommentReplies, {
      foreignKey: "member_id",
      as: "memberReplies",
    });
    Members.hasMany(models.UserSessionHistory, {
      foreignKey: "user_id",
      as: "userSessionHistory",
    });
  };
  return Members;
};
