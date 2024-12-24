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

import { Admins, PasswordResets } from "../../models/index.js";
import Sequelize from "sequelize";
import {
  extractAndDecryptToken,
  sendPasswordResetEmail,
} from "../Utilities/helpers.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";
import {
  Videos,
  Comments,
  VideoMetrics,
  ReviewsAndRatings,
} from "../../models/index.js";
import { Op } from "sequelize";
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
      where: {
        [Sequelize.Op.or]: [{ username }, { email }],
      },
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
        id: newAdmin.id,
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
    const admin = await Admins.findOne({ where: { email } });

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
      secure: process.env.NODE_ENV === "production" || true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "Login Successful",
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      admin: {
        id: admin.id,
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
        ? error // Use the existing error if already set
        : createError(500, "Internal server error.")
    );
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await Admins.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    }
    // Generate a reset token
    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration time

    // Insert into password_resets table
    await PasswordResets.create({
      reset_token: resetToken,
      reset_token_expiration: resetTokenExpiration,
      user_id: user.id,
      username: user.username,
      email: user.email,
      user_type: "admin",
    });
    // Create the reset password link
    const resetLink = `${process.env.ORIGIN_LINK}/reset-admin-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
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
    const users = await Members.findAll();
    res.status(200).json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    next(createError(500, "Error fetching users"));
  }
};

// Example: Update subscription plans
export const updateSubscription = async (req, res, next) => {
  const { userId, newPlan } = req.body;

  // Update logic...
};

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // Months are 0-based
    const currentYear = new Date().getFullYear();

    // Unique views for the current month
    const viewsThisMonth = await VideoMetrics.sum("views_count", {
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-${currentMonth}-01`),
        },
      },
    });

    // Items (videos) added this month
    const itemsThisMonth = await Videos.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-${currentMonth}-01`),
        },
      },
    });

    // New comments this month
    const commentsThisMonth = await Comments.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-${currentMonth}-01`),
        },
      },
    });
    // New comments this month
    const reviewsThisMonth = await ReviewsAndRatings.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-${currentMonth}-01`),
        },
      },
    });

    res.status(200).json({
      uniqueViews: viewsThisMonth || 0,
      itemsAdded: itemsThisMonth || 0,
      newComments: commentsThisMonth || 0,
      newReviews: reviewsThisMonth || 0,
    });
  } catch (error) {
    next(error);
  }
};
