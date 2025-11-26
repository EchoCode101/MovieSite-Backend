// Export all TypeScript Mongoose models
export { MemberModel, type Member } from "./member.model.js";
export { VideoModel, type Video } from "./video.model.js";
export { CommentModel, type Comment } from "./comment.model.js";
export { CommentReplyModel, type CommentReply } from "./commentReply.model.js";
export { ReviewModel, type Review } from "./review.model.js";
export { LikeDislikeModel, type LikeDislike } from "./likeDislike.model.js";
export { VideoMetricModel, type VideoMetric } from "./videoMetric.model.js";
export { NotificationModel, type Notification } from "./notification.model.js";
export { ReportModel, type Report } from "./report.model.js";
export { AdminModel, type Admin } from "./admin.model.js";
export { UserSessionHistoryModel, type UserSessionHistory } from "./userSessionHistory.model.js";
export { PlanModel, type Plan } from "./plan.model.js";
export { SubscriptionModel, type Subscription } from "./subscription.model.js";
export { ProfileModel, type Profile } from "./profile.model.js";
export { WatchlistModel, type WatchlistItem } from "./watchlist.model.js";
export { WatchHistoryModel, type WatchHistoryItem } from "./watchHistory.model.js";

// Password reset and token blacklist models
export { PasswordResetModel as PasswordResets, type PasswordReset } from "./passwordReset.model.js";
export { TokenBlacklistModel, type TokenBlacklist } from "./tokenBlacklist.model.js";

// Tag models
export { TagModel, type Tag } from "./tag.model.js";
export { VideoTagModel, type VideoTag } from "./videoTag.model.js";

