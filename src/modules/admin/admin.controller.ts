import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { AdminService } from "./admin.service.js";
import logger from "../../config/logger.js";
import type {
    AdminSignupInput,
    AdminLoginInput,
    UpdateSubscriptionInput,
    ResetPasswordInput,
} from "./admin.types.js";
import type { ApiResponse, AuthApiResponse } from "../../types/api.types.js";
import config from "../../config/env.js";
const adminService = new AdminService();

/**
 * Admin signup (public or restricted)
 */
export async function adminSignup(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const admin = await adminService.signup(req.body as AdminSignupInput);
        res.status(201).json({
            message: "Admin registered successfully!",
            admin: {
                id: (admin._id as any).toString(),
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
            Security: "Password is strong!",
        });
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error registering admin:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Internal server error.")
        );
    }
}

/**
 * Admin login (public)
 */
export async function adminLogin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await adminService.login(req.body as AdminLoginInput);

        // Set refresh token cookie
        res.cookie("encryptedRefreshToken", result.refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Standardized auth response format with tokens, as per backend docs
        const response: AuthApiResponse<(typeof result)["admin"]> = {
            success: true,
            message: result.message,
            data: result.admin,
            token: result.token,
            refreshToken: result.refreshToken,
        };

        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Admin login error:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Internal server error")
        );
    }
}

/**
 * Admin logout (authenticated - admin)
 */
export async function adminLogout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await adminService.logout(req);
        // Clear cookies
        res.clearCookie("encryptedRefreshToken", {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: "strict",
        });
        res.status(200).send("Admin logged out successfully.");
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Admin logout error:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Internal server error.")
        );
    }
}

/**
 * Forgot password (public)
 */
export async function forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email } = req.body;
        await adminService.forgotPassword(email);
        const response: ApiResponse = {
            success: true,
            message: "Please check your inbox, a password reset link has been sent.",
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error in forgotPassword:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Internal server error.")
        );
    }
}

/**
 * Reset password (public)
 */
export async function resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { token } = req.params;
        const { password } = req.body as ResetPasswordInput;
        await adminService.resetPassword(token, password);
        res.status(200).json({ message: "Password has been successfully reset." });
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error resetting password:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Something went wrong. Please try again.")
        );
    }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const users = await adminService.getAllUsers();
        res.status(200).json(users);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching users:", error);
        next(createError(500, "Error fetching users"));
    }
}

/**
 * Update user subscription (admin only)
 */
export async function updateSubscription(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await adminService.updateUserSubscription(
            req.body as UpdateSubscriptionInput
        );
        const response: ApiResponse<typeof result> = {
            success: true,
            message: "Subscription plan updated successfully",
            data: result,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error updating subscription:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Internal server error.")
        );
    }
}

/**
 * Get dashboard stats (admin only)
 */
export async function getDashboardStats(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const stats = await adminService.getDashboardStats();
        const response: ApiResponse<typeof stats> = {
            success: true,
            message: "Dashboard stats retrieved successfully",
            data: stats,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching dashboard stats:", error);
        next(createError(500, "Error fetching dashboard statistics"));
    }
}

/**
 * Get revenue data by period (admin only)
 */
export async function getRevenueData(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const period = (req.query.period as string) || 'month';
        const revenueData = await adminService.getRevenueData(period);
        const response: ApiResponse<typeof revenueData> = {
            success: true,
            message: "Revenue data retrieved successfully",
            data: revenueData,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching revenue data:", error);
        next(createError(500, "Error fetching revenue data"));
    }
}

/**
 * Get user growth data by period (admin only)
 */
export async function getUserGrowth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const period = (req.query.period as string) || 'month';
        const userGrowth = await adminService.getUserGrowth(period);
        const response: ApiResponse<typeof userGrowth> = {
            success: true,
            message: "User growth data retrieved successfully",
            data: userGrowth,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching user growth data:", error);
        next(createError(500, "Error fetching user growth data"));
    }
}

/**
 * Get content statistics (admin only)
 */
export async function getContentStats(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const contentStats = await adminService.getContentStats();
        const response: ApiResponse<typeof contentStats> = {
            success: true,
            message: "Content statistics retrieved successfully",
            data: contentStats,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching content statistics:", error);
        next(createError(500, "Error fetching content statistics"));
    }
}

/**
 * Get recent activity (admin only)
 */
export async function getRecentActivity(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const recentActivity = await adminService.getRecentActivity(limit);
        const response: ApiResponse<typeof recentActivity> = {
            success: true,
            message: "Recent activity retrieved successfully",
            data: recentActivity,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching recent activity:", error);
        next(createError(500, "Error fetching recent activity"));
    }
}

/**
 * Get top content by type (admin only)
 */
export async function getTopContent(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const type = (req.query.type as string) || 'all';
        const limit = parseInt((req.query.limit as string) || '5', 10);
        const topContent = await adminService.getTopContent(type, limit);
        const response: ApiResponse<typeof topContent> = {
            success: true,
            message: "Top content retrieved successfully",
            data: topContent,
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching top content:", error);
        next(createError(500, "Error fetching top content"));
    }
}

/**
 * Get current admin (admin only)
 */
export async function getCurrentAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const adminId = (req as any).user?.id;
        if (!adminId) {
            throw createError(401, "Unauthorized");
        }
        const admin = await adminService.getCurrentAdmin(adminId);
        const response: ApiResponse<{
            id: string;
            username: string;
            email: string;
            first_name?: string;
            last_name?: string;
            role: string;
        }> = {
            success: true,
            message: "Admin profile retrieved successfully",
            data: {
                id: (admin._id as any).toString(),
                username: admin.username,
                email: admin.email,
                first_name: admin.first_name,
                last_name: admin.last_name,
                role: admin.role,
            },
        };
        res.status(200).json(response);
    } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        logger.error("Error fetching current admin:", error);
        next(
            err.statusCode
                ? err
                : createError(500, "Error fetching admin profile")
        );
    }
}

