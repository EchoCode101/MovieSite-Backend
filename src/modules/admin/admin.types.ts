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

/**
 * Revenue data point for charts
 */
export interface RevenuePoint {
    label: string;
    amount: number;
    currency: string;
}

/**
 * User growth data point for charts
 */
export interface UserGrowthPoint {
    label: string;
    newUsers: number;
    activeUsers: number;
}

/**
 * Content statistics item
 */
export interface ContentStatsItem {
    type: 'videos' | 'movies' | 'tvShows' | 'episodes';
    label: string;
    count: number;
}

/**
 * Content statistics response
 */
export interface ContentStats {
    items: ContentStatsItem[];
}

/**
 * Recent activity type
 */
export type RecentActivityType =
    | 'user-created'
    | 'subscription-started'
    | 'subscription-cancelled'
    | 'content-played'
    | 'comment-created'
    | 'review-created';

/**
 * Recent activity item
 */
export interface RecentActivityItem {
    id: string;
    type: RecentActivityType;
    description: string;
    createdAt: string;
    user?: {
        id: string;
        name?: string;
        email?: string;
    };
    target?: {
        id: string;
        type: 'video' | 'movie' | 'tv-show' | 'episode';
        title: string;
    };
}

/**
 * Top content type
 */
export type TopContentType = 'video' | 'movie' | 'tv-show' | 'episode' | 'all';

/**
 * Top content item
 */
export interface TopContentItem {
    id: string;
    type: TopContentType;
    title: string;
    views: number;
    likes: number;
    thumbnailUrl?: string;
}

