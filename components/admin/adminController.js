// Import necessary modules
import {
  encrypt,
  hashPassword,
  comparePassword,
} from "../Utilities/encryptionUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Utilities/tokenUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";

import { Admins, PasswordResets, Members } from "../../models/index.js";
import {
  extractAndDecryptToken,
  sendPasswordResetEmail,
  blacklistToken,
} from "../Utilities/helpers.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";
import {
  Videos,
  Comments,
  VideoMetrics,
  ReviewsAndRatings,
} from "../../models/index.js";
// import validateAndSanitizeUserInput from "../Utilities/validator.js";

const { adminSignupSchema, loginSchema } = validationSchemas;

export const adminSignup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(createError(400, "All fields are required."));
  }
  const { error } = adminSignupSchema.validate(req.body);
  if (error) return next(createError(400, error.details[0].message));

  try {
    // Check if admin already exists
    const adminExists = await Admins.findOne({
      $or: [{ username }, { email }],
    });

    if (adminExists) {
      return next(createError(400, "Admin already exists."));
    }

    const hashedPassword = await hashPassword(password);
    // Create new admin
    const newAdmin = await Admins.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered successfully!",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
      Security: "Password is strong!",
    });
  } catch (err) {
    logger.error("Error registering admin:", err.message);
    next(createError(500, "Internal server error."));
  }
};

export const adminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate(req.body); // Joi validation schema for login
  if (error) return next(createError(400, error.details[0].message));

  try {
    const admin = await Admins.findOne({ email });

    if (!admin) {
      return next(createError(400, "Invalid email or password."));
    }

    const match = await comparePassword(password, admin.password);
    if (!match) {
      return next(createError(400, "Invalid email or password."));
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Encrypt tokens before sending
    const encryptedAccessToken = await encrypt(accessToken);
    const encryptedRefreshToken = await encrypt(refreshToken);

    // Update lastLogin column
    admin.lastLogin = new Date();
    await admin.save();

    res.cookie("encryptedRefreshToken", encryptedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "Login Successful",
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      admin: {
        id: admin._id,
        username: admin.username,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    logger.error("Admin login error:", err.message);
    next(createError(500, "Internal server error"));
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);
    await blacklistToken(decryptedToken);
    // Clear cookies
    res.clearCookie("encryptedRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).send("Admin logged out successfully.");
  } catch (err) {
    logger.error("Admin logout error:", err.message);
    next(
      err.status
        ? err // Use the existing error if already set
        : createError(500, "Internal server error.")
    );
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(createError(400, "Email is required"));
  }

  try {
    const user = await Admins.findOne({ email });
    if (!user) {
      return next(createError(404, "No account found with that email"));
    }
    // Generate a reset token
    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration time

    // Insert into password_resets table
    await PasswordResets.create({
      reset_token: resetToken,
      reset_token_expiration: resetTokenExpiration,
      user_id: user._id,
      user_type: "admin",
    });
    // Create the reset password link
    const resetLink = `${process.env.ORIGIN_LINK}/reset-admin-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      success: true,
      message: "Please check your inbox, a password reset link has been sent.",
    });
  } catch (error) {
    logger.error("Error in forgotPassword:", error);
    next(createError(500, "Internal server error."));
  }
};

// Get all users (admin view)
export const getAllUsers = async (req, res, next) => {
  try {
    // Fetch all members from the database
    const users = await Members.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    next(createError(500, "Error fetching users"));
  }
};

// Update subscription plans
export const updateSubscription = async (req, res, next) => {
  const { userId, newPlan } = req.body;

  if (!userId || !newPlan) {
    return next(createError(400, "userId and newPlan are required"));
  }

  const validPlans = ["Free", "Basic", "Premium", "Ultimate"];
  if (!validPlans.includes(newPlan)) {
    return next(
      createError(400, `newPlan must be one of: ${validPlans.join(", ")}`)
    );
  }

  try {
    const member = await Members.findByIdAndUpdate(
      userId,
      { subscription_plan: newPlan },
      { new: true, runValidators: true }
    );

    if (!member) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: {
        userId: member._id,
        subscription_plan: member.subscription_plan,
      },
    });
  } catch (error) {
    logger.error("Error updating subscription:", error);
    next(createError(500, "Internal server error."));
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // Months are 0-based
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    );

    // Unique views for the current month using aggregation
    const viewsResult = await VideoMetrics.aggregate([
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
    const itemsThisMonth = await Videos.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // New comments this month
    const commentsThisMonth = await Comments.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // New reviews this month
    const reviewsThisMonth = await ReviewsAndRatings.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    res.status(200).json({
      uniqueViews: viewsThisMonth,
      itemsAdded: itemsThisMonth,
      newComments: commentsThisMonth,
      newReviews: reviewsThisMonth,
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    next(createError(500, "Error fetching dashboard statistics"));
  }
};
