import { AdminModel, type Admin } from "../../models/admin.model.js";
import { MemberModel } from "../../models/member.model.js";
import { VideoModel } from "../../models/video.model.js";
import { CommentModel } from "../../models/comment.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { VideoMetricModel } from "../../models/videoMetric.model.js";
import type {
    AdminSignupInput,
    UpdateSubscriptionInput,
    DashboardStats,
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

        // New comments this month
        const commentsThisMonth = await CommentModel.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // New reviews this month
        const reviewsThisMonth = await ReviewModel.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        return {
            uniqueViews: viewsThisMonth,
            itemsAdded: itemsThisMonth,
            newComments: commentsThisMonth,
            newReviews: reviewsThisMonth,
        };
    }
}

