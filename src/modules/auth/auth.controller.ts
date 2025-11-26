import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import logger from "../../config/logger.js";
import config from "../../config/env.js";

const authService = new AuthService();

export const signupController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, subscription_plan } = req.body;

    const user = await authService.signup({
      username,
      email,
      password,
      subscription_plan,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        subscription_plan: user.subscription_plan,
      },
    });
  } catch (error) {
    logger.error("Signup error (TS controller):", error);
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { user, tokens } = await authService.login({ email, password });

    // Set refresh token cookie (mirroring legacy behavior)
    res.cookie("encryptedRefreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error("Login error (TS controller):", error);
    next(error);
  }
};

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    await authService.forgotPassword(email ?? "");

    res.status(200).json({
      success: true,
      message: "Please check your inbox, a password reset link has been sent.",
    });
  } catch (error) {
    logger.error("Forgot password error (TS controller):", error);
    next(error);
  }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password?: string };

    await authService.resetPassword(token, password ?? "");

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    logger.error("Reset password error (TS controller):", error);
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req);

    // Clear cookies
    res.clearCookie("encryptedRefreshToken", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error (TS controller):", error);
    next(error);
  }
};

