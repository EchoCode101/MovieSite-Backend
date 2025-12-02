
import createError from "http-errors";
import { AdminRepository } from "./admin.repository.js";
import { PasswordResets } from "../../models/index.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { encrypt, hashPassword, comparePassword } from "../../utils/encryption.js";
import { sendPasswordResetEmail } from "../../utils/helpers.js";
import { blacklistToken } from "../../utils/tokenBlacklist.js";
import { extractAndDecryptToken } from "../../utils/helpers.js";
import type {
    AdminSignupInput,
    AdminLoginInput,
    AdminLoginResponse,
    UpdateSubscriptionInput,
    DashboardStats,
    ResetPasswordInput,
    RevenuePoint,
    UserGrowthPoint,
    ContentStats,
    RecentActivityItem,
    TopContentItem,
} from "./admin.types.js";
import type { Admin } from "../../models/admin.model.js";
import config from "../../config/env.js";

export class AdminService {
    private repository: AdminRepository;

    constructor(repository = new AdminRepository()) {
        this.repository = repository;
    }

    /**
     * Admin signup
     */
    async signup(input: AdminSignupInput): Promise<Admin> {
        const adminExists = await this.repository.findByUsernameOrEmail(
            input.username,
            input.email
        );

        if (adminExists) {
            throw createError(400, "Admin already exists.");
        }

        const hashedPassword = await hashPassword(input.password);
        return await this.repository.create({
            ...input,
            password: hashedPassword,
        });
    }

    /**
     * Admin login
     */
    async login(input: AdminLoginInput): Promise<AdminLoginResponse> {
        const admin = await this.repository.findByEmail(input.email);
        if (!admin) {
            throw createError(400, "Invalid email or password.");
        }

        const match = await comparePassword(input.password, admin.password);
        if (!match) {
            throw createError(400, "Invalid email or password.");
        }

        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        // Encrypt tokens before sending
        const encryptedAccessToken = await encrypt(accessToken);
        const encryptedRefreshToken = await encrypt(refreshToken);

        // Update lastLogin
        await this.repository.updateLastLogin((admin._id as any).toString());

        return {
            message: "Login Successful",
            token: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            admin: {
                id: (admin._id as any).toString(),
                username: admin.username,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                role: admin.role,
            },
        };
    }

    /**
     * Admin logout
     */
    async logout(req: { path?: string; cookies?: { encryptedRefreshToken?: string }; headers?: { authorization?: string } }): Promise<void> {
        const decryptedToken = await extractAndDecryptToken(req as any);
        await blacklistToken(decryptedToken);
    }

    /**
     * Forgot password
     */
    async forgotPassword(email: string): Promise<void> {
        if (!email) {
            throw createError(400, "Email is required");
        }

        const admin = await this.repository.findByEmail(email);
        if (!admin) {
            throw createError(404, "No account found with that email");
        }

        // Generate a reset token
        const resetToken = generateAccessToken(admin);
        const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration

        // Insert into password_resets table
        await PasswordResets.create({
            reset_token: resetToken,
            reset_token_expiration: resetTokenExpiration,
            user_id: admin._id,
            user_type: "admin",
        });

        // Create the reset password link
        const resetLink = `${config.originAdmin}/reset-admin-password/${resetToken}`;
        await sendPasswordResetEmail(admin.email, resetLink);
    }

    /**
     * Reset password
     */
    async resetPassword(token: string, password: string): Promise<void> {
        if (!password || password.length < 6) {
            throw createError(400, "Password must be at least 6 characters long");
        }

        const now = new Date();
        const resetEntry = await PasswordResets.findOne({
            reset_token: token,
            reset_token_expiration: { $gt: now },
        });

        if (!resetEntry) {
            throw createError(400, "Invalid or expired reset password link");
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password);

        // Update the password based on user type
        if (resetEntry.user_type === "admin") {
            const { AdminModel } = await import("../../models/admin.model.js");
            await AdminModel.findByIdAndUpdate(resetEntry.user_id, {
                password: hashedPassword,
            });
        }

        // Delete the used reset token
        await PasswordResets.deleteOne({ reset_token: token });
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers() {
        return await this.repository.getAllUsers();
    }

    /**
     * Update user subscription (admin only)
     */
    async updateUserSubscription(input: UpdateSubscriptionInput): Promise<{
        userId: string;
        subscription_plan: string;
    }> {
        const validPlans = ["Free", "Basic", "Premium", "Ultimate"];
        if (!validPlans.includes(input.newPlan)) {
            throw createError(
                400,
                `newPlan must be one of: ${validPlans.join(", ")}`
            );
        }

        const member = await this.repository.updateUserSubscription(
            input.userId,
            input.newPlan
        );

        if (!member) {
            throw createError(404, "User not found");
        }

        return {
            userId: member._id.toString(),
            subscription_plan: member.subscription_plan,
        };
    }

    /**
     * Get dashboard stats (admin only)
     */
    async getDashboardStats(): Promise<DashboardStats> {
        return await this.repository.getDashboardStats();
    }

    /**
     * Get revenue data by period
     */
    async getRevenueData(period: string): Promise<RevenuePoint[]> {
        return await this.repository.getRevenueData(period);
    }

    /**
     * Get user growth data by period
     */
    async getUserGrowth(period: string): Promise<UserGrowthPoint[]> {
        return await this.repository.getUserGrowth(period);
    }

    /**
     * Get content statistics
     */
    async getContentStats(): Promise<ContentStats> {
        return await this.repository.getContentStats();
    }

    /**
     * Get recent activity
     */
    async getRecentActivity(limit: number): Promise<RecentActivityItem[]> {
        return await this.repository.getRecentActivity(limit);
    }

    /**
     * Get top content by type
     */
    async getTopContent(type: string, limit: number): Promise<TopContentItem[]> {
        return await this.repository.getTopContent(type, limit);
    }

    /**
     * Get current admin by ID
     */
    async getCurrentAdmin(adminId: string): Promise<Admin> {
        const admin = await this.repository.findById(adminId);
        if (!admin) {
            throw createError(404, "Admin not found");
        }
        return admin;
    }
}

