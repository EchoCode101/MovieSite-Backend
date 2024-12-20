import sequelize from "../db/db.js";

// Models Import
import TagsModel from "./Tags.js";
import VideosModel from "./Videos.js";
import AdminsModel from "./Admins.js";
import ReviewsModel from "./Reviews.js";
import MembersModel from "./Members.js";
import CommentsModel from "./Comments.js";
import VideoTagsModel from "./VideoTags.js";
import VideoMetricsModel from "./VideoMetrics.js";
import LikesDislikesModel from "./LikesDislikes.js";
import CommentRepliesModel from "./CommentReplies.js";
import PasswordResetsModel from "./PasswordResets.js";
import TokenBlacklistModel from "./TokenBlacklist.js";
import UserLoginHistoryModel from "./UserSessionHistory.js";

// Initialize Models

const Tags = TagsModel(sequelize);
const Admins = AdminsModel(sequelize);
const Videos = VideosModel(sequelize);
const Members = MembersModel(sequelize);
const Reviews = ReviewsModel(sequelize);
const Comments = CommentsModel(sequelize);
const VideoTags = VideoTagsModel(sequelize);
const VideoMetrics = VideoMetricsModel(sequelize);
const LikesDislikes = LikesDislikesModel(sequelize);
const CommentReplies = CommentRepliesModel(sequelize);
const PasswordResets = PasswordResetsModel(sequelize);
const TokenBlacklist = TokenBlacklistModel(sequelize);
const UserLoginHistory = UserLoginHistoryModel(sequelize);

// Sync and Initialize Tables
(async () => {
  try {
    await sequelize.sync(); // Sync tables
    console.log("✅ Models synced successfully!");
  } catch (error) {
    console.error("❌ Model synchronization failed:", error);
  }
})();

export {
  Tags,
  Admins,
  Videos,
  Reviews,
  Members,
  Comments,
  VideoTags,
  VideoMetrics,
  LikesDislikes,
  TokenBlacklist,
  CommentReplies,
  PasswordResets,
  UserLoginHistory,
};
