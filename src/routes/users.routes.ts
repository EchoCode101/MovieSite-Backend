import { Router } from "express";

import {
  authenticateAdminToken,
  authenticateToken,
  limiter,
} from "../middlewares/auth.middleware.js";

import {
    signupController,
    loginController,
} from "../modules/auth/auth.controller.js";

import {
    createUserController,
    getAllUsersController,
    getPaginatedUsersController,
    updateUserByIdController,
    deleteUserByIdController,
} from "../modules/users/users.controller.js";

import { authValidators } from "../modules/auth/auth.validators.js";
import { usersValidators } from "../modules/users/users.validators.js";
import { validate } from "../middlewares/validation.middleware.js";

import {
  getUserByIdController,
  profileController,
  updateProfileController,
  updateSubscriptionPlanController,
} from "../modules/users/users.controller.js";
import {
  saveUserVideoController,
  getUserVideosController,
  deleteUserVideoController,
  fetchVideoUrlController,
} from "../modules/usersVideos/userVideos.controller.js";
import {
  forgotPasswordController,
  resetPasswordController,
  logoutController,
} from "../modules/auth/auth.controller.js";

const router = Router();

// --- Auth Routes ---
router.post(
    "/signup",
    limiter,
    validate(authValidators.userSignupSchema),
    signupController,
);

router.post(
    "/login",
    limiter,
    validate(authValidators.loginSchema),
    loginController,
);

router.post("/logout", authenticateToken, limiter, logoutController);
router.post("/forgotPassword", limiter, forgotPasswordController);
router.post("/forgotPassword/reset/:token", limiter, resetPasswordController);

// --- Profile Routes (Me) ---
router.get("/me", authenticateToken, limiter, profileController); // Alias for /profile
router.get("/profile", authenticateToken, limiter, profileController); // Deprecated alias
router.put("/me", authenticateToken, limiter, updateProfileController); // Alias for /profile
router.put("/profile", authenticateToken, limiter, updateProfileController); // Deprecated alias
router.put(
  "/subscription_plan",
  authenticateToken,
  limiter,
  updateSubscriptionPlanController,
);

// --- My Videos Routes ---
router.post(
    "/saveVideoUrl",
    authenticateToken,
    limiter,
  saveUserVideoController,
);
router.get("/videos", authenticateToken, limiter, getUserVideosController);
router.delete("/videos/:id", authenticateToken, limiter, deleteUserVideoController);
router.get(
    "/fetchVideoUrl/:video_id",
    authenticateToken,
    limiter,
  fetchVideoUrlController,
);

// --- User Management Routes (Public/Admin) ---
router.get("/", authenticateAdminToken, getAllUsersController); // Admin only
router.get(
    "/paginated",
    authenticateToken,
    getPaginatedUsersController,
); // Auth required
router.post(
    "/",
    authenticateAdminToken,
    validate(usersValidators.createMemberSchema),
    createUserController,
); // Admin only
router.get("/:id", getUserByIdController); // Public (with sensitive data filtering)
router.put(
    "/:id",
    authenticateToken,
    validate(usersValidators.updateMemberSchema),
    updateUserByIdController,
); // Owner/Admin only
router.delete(
    "/:id",
    authenticateAdminToken,
    deleteUserByIdController,
); // Admin only

export default router;

