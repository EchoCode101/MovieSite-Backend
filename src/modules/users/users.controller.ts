import type { Request, Response, NextFunction } from "express";
import { UsersService } from "./users.service.js";
import logger from "../../config/logger.js";

const usersService = new UsersService();

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await usersService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        logger.error("Error creating user (TS controller):", error);
        next(error);
    }
};

export const getAllUsersController = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await usersService.getAllUsers();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        });
    } catch (error) {
        logger.error("Error fetching all users (TS controller):", error);
        next(error);
    }
};

export const getPaginatedUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const sort = String(req.query.sort ?? "createdAt");
        const order = String(req.query.order ?? "DESC") === "ASC" ? "ASC" : "DESC";

        const result = await usersService.getPaginatedUsers({
            page,
            limit,
            sort,
            order,
        });

        res.status(200).json(result);
    } catch (error) {
        logger.error("Error fetching paginated users (TS controller):", error);
        next(error);
    }
};

export const updateUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await usersService.updateUserById(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updated,
        });
    } catch (error) {
        logger.error("Error updating user (TS controller):", error);
        next(error);
    }
};

export const deleteUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await usersService.deleteUserById(req.params.id);
        res.status(200).json({
            success: true,
            message: "User and associated data deleted successfully.",
        });
    } catch (error) {
        logger.error("Error deleting user (TS controller):", error);
        next(error);
    }
};

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = (req as any).user as { id?: string; role?: string } | undefined;

        const memberData = await usersService.getUserByIdDetailed(req.params.id, {
            id: currentUser?.id,
            role: currentUser?.role,
        });

        res.status(200).json(memberData);
    } catch (error) {
        logger.error("Error fetching user details (TS controller):", error);
        next(error);
    }
};

export const profileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = (req as any).user as { email?: string; id?: string } | undefined;
        const email = currentUser?.email;
        const userId = currentUser?.id;

        if (!email) {
            logger.warn("Profile request missing email in token", {
                userId,
                hasUser: !!currentUser
            });
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        logger.debug("Fetching profile", { email, userId });
        const profile = await usersService.getProfile(email);

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: profile,
        });
    } catch (error) {
        logger.error("Profile error (TS controller):", {
            error: error instanceof Error ? error.message : error,
            user: (req as any).user,
        });
        next(error);
    }
};

export const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = (req as any).user as { id?: string } | undefined;
        const userId = currentUser?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const updated = await usersService.updateProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updated,
        });
    } catch (error) {
        logger.error("Update profile error (TS controller):", error);
        next(error);
    }
};

export const updateSubscriptionPlanController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const currentUser = (req as any).user as { email?: string } | undefined;
        const email = currentUser?.email;
        if (!email) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { subscription_plan } = req.body as { subscription_plan: string };

        const result = await usersService.updateSubscriptionPlan(email, subscription_plan);

        res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            data: result,
        });
    } catch (error) {
        logger.error("Subscription update error (TS controller):", error);
        next(error);
    }
};

