import {
  Members,
  PasswordResets,
  UserLoginHistory,
} from "../../models/index.js";
import {
  encrypt,
  hashPassword,
  comparePassword,
} from "../Utilities/encryptionUtils.js";
import logger from "../Utilities/logger.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Utilities/tokenUtils.js";
import createError from "http-errors"; // For more expressive error creation
import {
  extractAndDecryptToken,
  blacklistToken,
  sendPasswordResetEmail,
} from "../Utilities/helpers.js";
import { Sequelize } from "sequelize";
import validationSchemas from "../Utilities/validationSchemas.js";

const { userSignupSchema, loginSchema } = validationSchemas;
// import validateAndSanitizeUserInput from "../Utilities/validator.js";

// Handle user signup
export const signup = async (req, res, next) => {
  const { error } = userSignupSchema.validate(req.body);
  if (error) return next(createError(400, error.details[0].message));
  const { username, password, email, subscription_plan } = req.body;

  try {
    // Check if user exists
    const userExists = await Members.findOne({
      where: {
        [Sequelize.Op.or]: [{ username }, { email }],
      },
    });

    if (userExists) {
      return next(createError(400, "Username or email already exists."));
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await Members.create({
      username,
      email,
      password: hashedPassword,
      subscription_plan,
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        subscription_plan: newUser.subscription_plan,
      },
    });
  } catch (err) {
    next(createError(500, "Error registering user."));
  }
};

// Handle user login
export const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body); // Joi validation schema for login
  if (error) return next(createError(400, error.details[0].message));

  const { email, password } = req.body;

  try {
    const user = await Members.findOne({ where: { email } });
    if (!user) {
      return next(createError(400, "Invalid email or password"));
    }
    const match = await comparePassword(password, user.password);

    if (!match) return next(createError(400, "Invalid email or password"));

    // Save login history
    await UserLoginHistory.create({
      user_id: user.member_id,
      login_time: new Date(),
      ip_address: req.ip || req.headers["x-forwarded-for"] || "Unknown",
      device_info: req.headers["user-agent"] || "Unknown",
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Encrypt tokens before sending
    const encryptedAccessToken = await encrypt(accessToken);
    const encryptedRefreshToken = await encrypt(refreshToken);
    // Send secure cookies
    res.cookie("encryptedRefreshToken", encryptedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    // Respond to client
    res.status(200).json({
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      data: {
        id: user.member_id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    logger.error("Login error:", err);
    next(createError(500, "Internal Server Error"));
  }
};

// Handle user logout
export const logout = async (req, res, next) => {
  try {
    // Ensure user is logged in
    if (!req.user || !req.user.id) {
      return next(createError(400, "Please login first"));
    }
    const member_id = req.user.id;

    // Destroy the current session
    const deletedSession = await UserLoginHistory.destroy({
      where: { user_id: member_id },
    });
    if (!deletedSession) {
      return next(createError(400, "No active session found"));
    }

    // Record logout time in login history
    await UserLoginHistory.update(
      { logout_time: new Date() },
      {
        where: {
          user_id: member_id,
          logout_time: null, // Ensure only active sessions are updated
        },
      }
    );
    const decryptedToken = await extractAndDecryptToken(req);
    await blacklistToken(decryptedToken);

    // Clear cookies
    res.clearCookie("encryptedRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    logger.error("Logout error:", err);
    next(
      err.status
        ? error // Use the existing error if already set
        : createError(500, "Error logging out")
    );
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  // Validate input
  if (!email) {
    return next(createError(400, "Email is required"));
  }

  try {
    const user = await Members.findOne({ where: { email } });
    if (!user) {
      return next(createError(404, "No account found with that email"));
    }

    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration

    await PasswordResets.create({
      reset_token: resetToken,
      reset_token_expiration: resetTokenExpiration,
      user_id: user.id,
      username: user.username,
      email: user.email,
      user_type: "member",
    });

    const resetLink = `${process.env.ORIGIN_LINK}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      message: "Please check your inbox, a password reset link has been sent.",
    });
  } catch (error) {
    next(createError(500, "Something went wrong. Please try again."));
  }
};
