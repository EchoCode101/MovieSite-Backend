import sequelize from "../db/db.js";

// Models Import
import TagsModel from "./Tags.js";
import VideosModel from "./Videos.js";
import AdminsModel from "./Admins.js";
import MembersModel from "./Members.js";
import CommentsModel from "./Comments.js";
import VideoTagsModel from "./VideoTags.js";
import VideoMetricsModel from "./VideoMetrics.js";
import LikesDislikesModel from "./LikesDislikes.js";
import CommentRepliesModel from "./CommentReplies.js";
import PasswordResetsModel from "./PasswordResets.js";
import TokenBlacklistModel from "./TokenBlacklist.js";
import UserSessionHistoryModel from "./UserSessionHistory.js";
import ReviewsAndRatingsModel from "./ReviewsAndRatings.js";

// Initialize Models
const Tags = TagsModel(sequelize);
const Admins = AdminsModel(sequelize);
const Videos = VideosModel(sequelize);
const Members = MembersModel(sequelize);
const Comments = CommentsModel(sequelize);
const VideoTags = VideoTagsModel(sequelize);
const VideoMetrics = VideoMetricsModel(sequelize);
const LikesDislikes = LikesDislikesModel(sequelize);
const CommentReplies = CommentRepliesModel(sequelize);
const PasswordResets = PasswordResetsModel(sequelize);
const TokenBlacklist = TokenBlacklistModel(sequelize);
const UserSessionHistory = UserSessionHistoryModel(sequelize);
const ReviewsAndRatings = ReviewsAndRatingsModel(sequelize);

// Define associations
Videos.associate({
  Tags,
  ReviewsAndRatings,
  Comments,
  VideoTags,
  VideoMetrics,
  LikesDislikes,
});
VideoMetrics.associate({ Videos });
ReviewsAndRatings.associate({ Videos, Members, LikesDislikes });
CommentReplies.associate({ Comments, Members, LikesDislikes });
Members.associate({
  Comments,
  ReviewsAndRatings,
  CommentReplies,
  UserSessionHistory,
});
UserSessionHistory.associate({ Members });
Comments.associate({ Members, Videos, CommentReplies, LikesDislikes });
LikesDislikes.associate({
  Members,
  ReviewsAndRatings,
  Videos,
  Comments,
  CommentReplies,
});

// Sync and Export Models
(async () => {
  try {
    await sequelize.sync();
    console.log("✅ Models synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
  }
})();

export {
  Tags,
  Admins,
  Videos,
  Members,
  Comments,
  VideoTags,
  VideoMetrics,
  LikesDislikes,
  TokenBlacklist,
  CommentReplies,
  PasswordResets,
  UserSessionHistory,
  ReviewsAndRatings,
};
