import type { Admin } from "../../models/admin.model.js";

/**
 * Input for admin signup
 */
export interface AdminSignupInput {
    username: string;
    email: string;
    password: string;
}

/**
 * Input for admin login
 */
export interface AdminLoginInput {
    email: string;
    password: string;
}

/**
 * Admin login response
 */
export interface AdminLoginResponse {
    message: string;
    token: string;
    refreshToken: string;
    admin: {
        id: string;
        username: string;
        first_name?: string;
        last_name?: string;
        email: string;
        role: string;
    };
}

/**
 * Input for updating subscription
 */
export interface UpdateSubscriptionInput {
    userId: string;
    newPlan: "Free" | "Basic" | "Premium" | "Ultimate";
}

/**
 * Dashboard stats response
 */
export interface DashboardStats {
    uniqueViews: number;
    itemsAdded: number;
    moviesCount: number;
    tvShowsCount: number;
    episodesCount: number;
    channelsCount: number;
    newComments: number;
    newReviews: number;
    activeSubscriptions: number;
    totalTransactions: number;
    totalRevenue: number;
    activeUsers: number;
    totalUsers: number;
}

/**
 * Input for reset password
 */
export interface ResetPasswordInput {
    password: string;
}

