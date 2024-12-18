import sequelize from "../db/db.js";
import MembersModel from "./Members.js";
import VideosModel from "./Videos.js";
import ReviewsModel from "./Reviews.js";
import CommentRepliesModel from "./CommentReplies.js";
import LikesDislikesModel from "./LikesDislikes.js";
import CommentsModel from "./Comments.js";
import AdminsModel from "./Admins.js";
import PasswordResetsModel from "./PasswordResets.js";
import TokenBlacklistModel from "./TokenBlacklist.js";

// Initialize Models
const Members = MembersModel(sequelize);
const Videos = VideosModel(sequelize);
const Reviews = ReviewsModel(sequelize);
const CommentReplies = CommentRepliesModel(sequelize);
const LikesDislikes = LikesDislikesModel(sequelize);
const Comments = CommentsModel(sequelize);
const Admins = AdminsModel(sequelize);
const PasswordResets = PasswordResetsModel(sequelize);
const TokenBlacklist = TokenBlacklistModel(sequelize);

// Establish Associations
// Videos & Reviews
Videos.hasMany(Reviews, { foreignKey: "video_id", as: "videoReviews" });
Reviews.belongsTo(Videos, { foreignKey: "video_id", as: "video" });

// Members & Reviews
Members.hasMany(Reviews, { foreignKey: "member_id", as: "memberReviews" });
Reviews.belongsTo(Members, { foreignKey: "member_id", as: "member" });

// Members & Comments
Members.hasMany(Comments, { foreignKey: "member_id", as: "memberComments" });
Comments.belongsTo(Members, { foreignKey: "member_id", as: "member" });

// Videos & Comments
Videos.hasMany(Comments, { foreignKey: "video_id", as: "videoComments" });
Comments.belongsTo(Videos, { foreignKey: "video_id", as: "video" });

// Correct Association in Models Initialization
Comments.hasMany(LikesDislikes, {
  foreignKey: "target_id",
  as: "likesDislikes",
  scope: { target_type: "comment" }, // Ensure the correct type is enforced
});
LikesDislikes.belongsTo(Members, {
  foreignKey: "user_id",
  as: "user", // The user who liked/disliked
});

LikesDislikes.belongsTo(Comments, {
  foreignKey: "target_id",
  as: "commentTarget",
});

// Test Database Connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    // Ensure models are synced with the database
    await sequelize.sync();
    console.log("Models synced successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

// Export Models
export {
  Members,
  PasswordResets,
  TokenBlacklist,
  Videos,
  Reviews,
  CommentReplies,
  LikesDislikes,
  Comments,
  Admins,
};
