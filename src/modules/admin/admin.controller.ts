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
import type { ApiResponse } from "../../types/api.types.js";
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

        res.json(result);
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
        res.status(200).json(stats);
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error fetching dashboard stats:", error);
        next(createError(500, "Error fetching dashboard statistics"));
    }
}

