// Sequelize setup for Members and PasswordResets models
import dotenv from "dotenv";
import { DataTypes, Sequelize } from "sequelize";
// Determine the environment
const env = process.env.NODE_ENV || "development";
// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Disable logging for cleaner console output
  define: {
    underscored: true, // Use snake_case for all columns
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
});

// Define the Members model
export const Members = sequelize.define(
  "members",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subscription_plan: {
      type: DataTypes.STRING,
      defaultValue: "Free",
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    device_logged_in: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    profile_pic: DataTypes.TEXT,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    comments_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reviews: DataTypes.JSONB,
    status: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
    date_of_creation: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "date_of_creation", // Map the custom field
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "updated_at", // Map the custom field
    },
  },
  {
    tableName: "members",
    timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt`
  }
);

// Define the PasswordResets model
export const PasswordResets = sequelize.define(
  "password_resets",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reset_token_expiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "password_resets",
    timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt` // Explicit table name
  }
);
// Define TokenBlacklist Schema
export const TokenBlacklist = sequelize.define(
  "token_blacklist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "token_blacklist",
    timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt` // Explicit table name
  }
);
// Define Videos Model
export const Videos = sequelize.define(
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
// Define Admins Model
export const Admins = sequelize.define(
  "admins",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: "admin",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admins",
    timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt` // Explicit table name
  }
);

export const Comments = sequelize.define(
  "comments",
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
        model: "members", // Refers to the Members table
        key: "id",
      },
      onDelete: "CASCADE",
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "videos", // Refers to the Videos table
        key: "video_id",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "comments",
    timestamps: false, // Disable auto timestamps to prevent Sequelize from expecting `createdAt` and `updatedAt`
  }
);
export const Reviews = sequelize.define(
  "reviews",
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
        model: "videos",
        key: "video_id",
      },
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "members",
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 10,
      },
    },
    content: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
export const LikesDislikes = sequelize.define(
  "likes_dislikes",
  {
    like_dislike_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: {
          args: [["comment", "review", "comment_reply", "video"]],
          msg: "Invalid target type",
        },
      },
    },
    is_like: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "likes_dislikes",
    timestamps: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "target_id", "target_type"],
      },
    ],
  }
);
export const CommentReplies = sequelize.define(
  "comment_replies",
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
        model: "comments", // Ensure this matches the exact table name
        key: "comment_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "members", // Ensure this matches the exact table name
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "comment_replies", // Matches the actual table name in the DB
    timestamps: false,
  }
);

// Sync models with the database
await sequelize.sync();
