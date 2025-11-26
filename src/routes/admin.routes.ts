import { Router } from "express";
import { authenticateAdminToken, limiter } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
    adminSignup,
    adminLogin,
    adminLogout,
    forgotPassword,
    resetPassword,
    getAllUsers,
    updateSubscription,
    getDashboardStats,
} from "../modules/admin/admin.controller.js";
import {
    adminSignupSchema,
    loginSchema,
    updateSubscriptionSchema,
    resetPasswordSchema,
} from "../modules/admin/admin.validators.js";
import Joi from "joi";

const router = Router();

// Forgot password (public)
router.post(
    "/forgotPassword",
    limiter,
    validate(Joi.object({ email: Joi.string().email().required() }), { target: "body" }),
    forgotPassword,
);

// Admin signup (public or restricted)
router.post(
    "/signup",
    limiter,
    validate(adminSignupSchema, { target: "body" }),
    adminSignup,
);

// Admin login (public)
router.post(
    "/login",
    limiter,
    validate(loginSchema, { target: "body" }),
    adminLogin,
);

// Admin logout (authenticated - admin)
router.post("/logout", authenticateAdminToken, adminLogout);

// Get all users (admin only)
router.get("/users", authenticateAdminToken, limiter, getAllUsers);

// Get dashboard stats (admin only)
router.get("/stats", authenticateAdminToken, getDashboardStats);

// Update user subscription (admin only)
router.put(
    "/subscription",
    authenticateAdminToken,
    limiter,
    validate(updateSubscriptionSchema, { target: "body" }),
    updateSubscription,
);

// Reset password (public)
router.post(
    "/forgotPassword/reset/:token",
    limiter,
    validate(resetPasswordSchema, { target: "body" }),
    resetPassword,
);

export default router;


