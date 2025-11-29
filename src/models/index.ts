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

// Content domain models
export { GenreModel, type Genre } from "./genre.model.js";
export { CastCrewModel, type CastCrew, type CastCrewType } from "./castCrew.model.js";
export { MovieModel, type Movie, type AccessType, type PurchaseType, type TrailerUrlType, type ContentStatus } from "./movie.model.js";
export { TvShowModel, type TvShow } from "./tvShow.model.js";
export { SeasonModel, type Season } from "./season.model.js";
export { EpisodeModel, type Episode } from "./episode.model.js";
export { ChannelModel, type Channel } from "./channel.model.js";

// User/Profile domain models
export { DeviceModel, type Device } from "./device.model.js";

// Monetization domain models
export { CouponModel, type Coupon, type DiscountType } from "./coupon.model.js";
export { TaxModel, type Tax } from "./tax.model.js";
export { PaymentMethodModel, type PaymentMethod } from "./paymentMethod.model.js";
export { TransactionModel, type Transaction, type TransactionType, type TransactionStatus } from "./transaction.model.js";
export { PayPerViewModel, type PayPerView, type PayPerViewTargetType } from "./payPerView.model.js";

// CMS/Config domain models
export { BannerModel, type Banner } from "./banner.model.js";
export { SettingModel, type Setting, type SettingGroup } from "./setting.model.js";
export { PageModel, type Page } from "./page.model.js";

