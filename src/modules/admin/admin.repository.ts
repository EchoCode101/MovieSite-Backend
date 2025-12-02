import { AdminModel, type Admin } from "../../models/admin.model.js";
import { MemberModel } from "../../models/member.model.js";
import { VideoModel } from "../../models/video.model.js";
import { MovieModel } from "../../models/movie.model.js";
import { TvShowModel } from "../../models/tvShow.model.js";
import { EpisodeModel } from "../../models/episode.model.js";
import { ChannelModel } from "../../models/channel.model.js";
import { CommentModel } from "../../models/comment.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { VideoMetricModel } from "../../models/videoMetric.model.js";
import { SubscriptionModel } from "../../models/subscription.model.js";
import { TransactionModel } from "../../models/transaction.model.js";
import { LikeDislikeModel } from "../../models/likeDislike.model.js";
import type {
    AdminSignupInput,
    UpdateSubscriptionInput,
    DashboardStats,
    RevenuePoint,
    UserGrowthPoint,
    ContentStats,
    ContentStatsItem,
    RecentActivityItem,
    TopContentItem,
} from "./admin.types.js";

export class AdminRepository {
    /**
     * Find admin by email
     */
    async findByEmail(email: string): Promise<Admin | null> {
        return await AdminModel.findOne({ email }).exec();
    }

    /**
     * Find admin by username or email
     */
    async findByUsernameOrEmail(username: string, email: string): Promise<Admin | null> {
        return await AdminModel.findOne({
            $or: [{ username }, { email }],
        }).exec();
    }

    /**
     * Create a new admin
     */
    async create(data: AdminSignupInput & { password: string }): Promise<Admin> {
        return await AdminModel.create({
            username: data.username,
            email: data.email,
            password: data.password,
        });
    }

    /**
     * Update admin last login
     */
    async updateLastLogin(id: string): Promise<Admin | null> {
        return await AdminModel.findByIdAndUpdate(
            id,
            { lastLogin: new Date() },
            { new: true }
        ).exec();
    }

    /**
     * Get all users (members)
     */
    async getAllUsers() {
        return await MemberModel.find().select("-password").exec();
    }

    /**
     * Update user subscription plan
     */
    async updateUserSubscription(
        userId: string,
        newPlan: string
    ): Promise<{ _id: string; subscription_plan: string } | null> {
        const member = await MemberModel.findByIdAndUpdate(
            userId,
            { subscription_plan: newPlan },
            { new: true, runValidators: true }
        )
            .select("_id subscription_plan")
            .exec();
        
        if (!member) {
            return null;
        }
        
        return {
            _id: (member._id as any).toString(),
            subscription_plan: member.subscription_plan,
        };
    }

    /**
     * Get dashboard stats
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const startOfMonth = new Date(
            `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
        );

        // Unique views for the current month using aggregation
        const viewsResult = await VideoMetricModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views_count" },
                },
            },
        ]);
        const viewsThisMonth = viewsResult[0]?.totalViews || 0;

        // Items (videos) added this month
        const itemsThisMonth = await VideoModel.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // Content counts (all time)
        const [moviesCount, tvShowsCount, episodesCount, channelsCount] = await Promise.all([
            MovieModel.countDocuments({ deleted_at: null }),
            TvShowModel.countDocuments({ deleted_at: null }),
            EpisodeModel.countDocuments({ deleted_at: null }),
            ChannelModel.countDocuments({ deleted_at: null, is_active: true }),
        ]);

        // New comments this month
        const commentsThisMonth = await CommentModel.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // New reviews this month
        const reviewsThisMonth = await ReviewModel.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // Subscription stats
        const activeSubscriptions = await SubscriptionModel.countDocuments({
            status: "active",
            ends_at: { $gt: new Date() },
        });

        // Transaction stats
        const [totalTransactions, revenueResult] = await Promise.all([
            TransactionModel.countDocuments({ status: "paid" }),
            TransactionModel.aggregate([
                {
                    $match: { status: "paid" },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                    },
                },
            ]),
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // User stats
        const [totalUsers, activeUsers] = await Promise.all([
            MemberModel.countDocuments(),
            MemberModel.countDocuments({
                status: "Active",
            }),
        ]);

        return {
            uniqueViews: viewsThisMonth,
            itemsAdded: itemsThisMonth,
            moviesCount,
            tvShowsCount,
            episodesCount,
            channelsCount,
            newComments: commentsThisMonth,
            newReviews: reviewsThisMonth,
            activeSubscriptions,
            totalTransactions,
            totalRevenue,
            activeUsers,
            totalUsers,
        };
    }

    /**
     * Get revenue data by period
     */
    async getRevenueData(period: string): Promise<RevenuePoint[]> {
        const now = new Date();
        let startDate: Date;
        let groupFormat: Record<string, unknown>;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
        }

        const results = await TransactionModel.aggregate([
            {
                $match: {
                    status: 'paid',
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: groupFormat,
                    amount: { $sum: '$amount' },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
            },
        ]);

        return results.map((item) => {
            let label = '';
            if (period === 'day' || period === 'week') {
                label = `${item._id.month}/${item._id.day}/${item._id.year}`;
            } else if (period === 'month') {
                label = `${item._id.month}/${item._id.year}`;
            } else {
                label = `${item._id.year}`;
            }

            return {
                label,
                amount: item.amount,
                currency: 'USD',
            };
        });
    }

    /**
     * Get user growth data by period
     */
    async getUserGrowth(period: string): Promise<UserGrowthPoint[]> {
        const now = new Date();
        let startDate: Date;
        let groupFormat: Record<string, unknown>;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
        }

        const results = await MemberModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: groupFormat,
                    newUsers: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
            },
        ]);

        // Get active users count for each period
        const points: UserGrowthPoint[] = [];
        for (const item of results) {
            let label = '';
            if (period === 'day' || period === 'week') {
                label = `${item._id.month}/${item._id.day}/${item._id.year}`;
            } else if (period === 'month') {
                label = `${item._id.month}/${item._id.year}`;
            } else {
                label = `${item._id.year}`;
            }

            // Count active users up to this period
            const periodEnd = new Date(
                item._id.year || now.getFullYear(),
                (item._id.month || 1) - 1,
                item._id.day || 1,
            );
            const activeUsers = await MemberModel.countDocuments({
                status: 'Active',
                createdAt: { $lte: periodEnd },
            });

            points.push({
                label,
                newUsers: item.newUsers,
                activeUsers,
            });
        }

        return points;
    }

    /**
     * Get content statistics
     */
    async getContentStats(): Promise<ContentStats> {
        const [videosCount, moviesCount, tvShowsCount, episodesCount] = await Promise.all([
            VideoModel.countDocuments({ deleted_at: null }),
            MovieModel.countDocuments({ deleted_at: null }),
            TvShowModel.countDocuments({ deleted_at: null }),
            EpisodeModel.countDocuments({ deleted_at: null }),
        ]);

        const items: ContentStatsItem[] = [
            { type: 'videos', label: 'Videos', count: videosCount },
            { type: 'movies', label: 'Movies', count: moviesCount },
            { type: 'tvShows', label: 'TV Shows', count: tvShowsCount },
            { type: 'episodes', label: 'Episodes', count: episodesCount },
        ];

        return { items };
    }

    /**
     * Get recent activity
     */
    async getRecentActivity(limit: number): Promise<RecentActivityItem[]> {
        const activities: RecentActivityItem[] = [];

        // Get recent users
        const recentUsers = await MemberModel.find()
            .sort({ createdAt: -1 })
            .limit(Math.floor(limit / 2))
            .select('_id username email first_name last_name createdAt')
            .exec();

        for (const user of recentUsers) {
            activities.push({
                id: (user._id as any).toString(),
                type: 'user-created',
                description: `New user ${user.username} registered`,
                createdAt: user.createdAt.toISOString(),
                user: {
                    id: (user._id as any).toString(),
                    name: user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username,
                    email: user.email,
                },
            });
        }

        // Get recent subscriptions
        const recentSubscriptions = await SubscriptionModel.find()
            .sort({ createdAt: -1 })
            .limit(Math.floor(limit / 2))
            .populate('user_id', 'username email first_name last_name')
            .exec();

        for (const sub of recentSubscriptions) {
            const user = sub.user_id as any;
            activities.push({
                id: (sub._id as any).toString(),
                type: sub.status === 'active' ? 'subscription-started' : 'subscription-cancelled',
                description: `Subscription ${sub.status === 'active' ? 'started' : 'cancelled'} for ${user?.username || 'user'}`,
                createdAt: sub.createdAt.toISOString(),
                user: user
                    ? {
                          id: (user._id as any).toString(),
                          name: user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username,
                          email: user.email,
                      }
                    : undefined,
            });
        }

        // Get recent comments
        const recentComments = await CommentModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('member_id', 'username email first_name last_name')
            .exec();

        for (const comment of recentComments) {
            const user = comment.member_id as any;
            activities.push({
                id: (comment._id as any).toString(),
                type: 'comment-created',
                description: `${user?.username || 'User'} commented`,
                createdAt: comment.createdAt.toISOString(),
                user: user
                    ? {
                          id: (user._id as any).toString(),
                          name: user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username,
                          email: user.email,
                      }
                    : undefined,
            });
        }

        // Sort by createdAt and limit
        return activities
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }

    /**
     * Get top content by type
     */
    async getTopContent(type: string, limit: number): Promise<TopContentItem[]> {
        const items: TopContentItem[] = [];

        if (type === 'all' || type === 'movie') {
            const movies = await MovieModel.find({ deleted_at: null })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('_id title thumbnail_url createdAt')
                .exec();

            for (const movie of movies) {
                const movieId = (movie._id as any).toString();
                const likesCount = await LikeDislikeModel.countDocuments({
                    target_type: 'movie',
                    target_id: movieId,
                    is_like: true,
                });

                // For now, use 0 for views as VideoMetricModel tracks videos, not movies
                // This can be enhanced later with a proper views tracking system
                const views = 0;

                items.push({
                    id: movieId,
                    type: 'movie',
                    title: movie.title,
                    views,
                    likes: likesCount,
                    thumbnailUrl: movie.thumbnail_url,
                });
            }
        }

        if (type === 'all' || type === 'tv-show') {
            const tvShows = await TvShowModel.find({ deleted_at: null })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('_id title thumbnail_url createdAt')
                .exec();

            for (const tvShow of tvShows) {
                const tvShowId = (tvShow._id as any).toString();
                const likesCount = await LikeDislikeModel.countDocuments({
                    target_type: 'tvshow',
                    target_id: tvShowId,
                    is_like: true,
                });

                // For now, use 0 for views as VideoMetricModel tracks videos, not tv shows
                // This can be enhanced later with a proper views tracking system
                const views = 0;

                items.push({
                    id: tvShowId,
                    type: 'tv-show',
                    title: tvShow.title,
                    views,
                    likes: likesCount,
                    thumbnailUrl: tvShow.thumbnail_url,
                });
            }
        }

        if (type === 'all' || type === 'episode') {
            const episodes = await EpisodeModel.find({ deleted_at: null })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('_id title thumbnail_url createdAt')
                .exec();

            for (const episode of episodes) {
                const episodeId = (episode._id as any).toString();
                const likesCount = await LikeDislikeModel.countDocuments({
                    target_type: 'episode',
                    target_id: episodeId,
                    is_like: true,
                });

                // For now, use 0 for views as VideoMetricModel tracks videos, not episodes
                // This can be enhanced later with a proper views tracking system
                const views = 0;

                items.push({
                    id: episodeId,
                    type: 'episode',
                    title: episode.title,
                    views,
                    likes: likesCount,
                    thumbnailUrl: episode.thumbnail_url,
                });
            }
        }

        if (type === 'all' || type === 'video') {
            const videos = await VideoModel.find({ deleted_at: null })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('_id title thumbnail_url createdAt')
                .exec();

            for (const video of videos) {
                const videoId = (video._id as any).toString();
                const likesCount = await LikeDislikeModel.countDocuments({
                    target_type: 'video',
                    target_id: videoId,
                    is_like: true,
                });

                // Get views from VideoMetricModel
                const videoMetric = await VideoMetricModel.findOne({
                    video_id: videoId,
                }).exec();
                const views = videoMetric?.views_count || 0;

                items.push({
                    id: videoId,
                    type: 'video',
                    title: video.title,
                    views,
                    likes: likesCount,
                    thumbnailUrl: video.thumbnail_url,
                });
            }
        }

        // Sort by views and limit
        return items.sort((a, b) => b.views - a.views).slice(0, limit);
    }

    /**
     * Find admin by ID
     */
    async findById(id: string): Promise<Admin | null> {
        return await AdminModel.findById(id).select('-password').exec();
    }
}

