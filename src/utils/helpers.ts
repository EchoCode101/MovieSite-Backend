import type { Request } from "express";
import createError from "http-errors";
import nodemailer from "nodemailer";
import type { Transporter, SendMailOptions } from "nodemailer";

import { decrypt } from "./encryption.js";
import { blacklistToken as blacklistTokenUtil, isTokenBlacklisted } from "./tokenBlacklist.js";
import logger from "../config/logger.js";
import { extractToken } from "./jwt.js";
import config from "../config/env.js";

/**
 * Extract and decrypt token from request (cookie or Authorization header)
 * @param req - Express request object
 * @returns Decrypted token string
 * @throws HttpError if token is missing or invalid
 */
export async function extractAndDecryptToken(req: Request): Promise<string> {
    let token: string | undefined;

    // For refresh token endpoint, check cookie first
    if (req.path && req.path.includes("/refresh")) {
        token = req.cookies?.encryptedRefreshToken;
        if (!token) {
            logger.error("DEBUG: Refresh token missing in cookies", {
                cookies: req.cookies,
                path: req.path,
            });
            // Fallback to Authorization header if cookie not found
            try {
                token = extractToken(req);
            } catch (err) {
                throw createError(
                    401,
                    "Refresh token required in cookie or Authorization header"
                );
            }
        }
    } else {
        // For other endpoints, try cookie first (if available), then Authorization header
        token = req.cookies?.encryptedAccessToken;
        if (!token) {
            try {
                token = extractToken(req);
            } catch (err) {
                logger.error("DEBUG: Access token missing", {
                    cookies: req.cookies,
                    headers: req.headers,
                    path: req.path,
                });
                throw err;
            }
        }
    }

    return await decrypt(token);
}

/**
 * Check if a token is blacklisted
 * @param decryptedToken - Decrypted token string
 * @returns True if token is blacklisted, false otherwise
 */
export async function blacklistTokenCheck(decryptedToken: string): Promise<boolean> {
    return await isTokenBlacklisted(decryptedToken);
}

/**
 * Add a token to the blacklist
 * @param decryptedToken - Decrypted token string to blacklist
 * @param expiryInSeconds - Expiry time in seconds (default: 30)
 */
export async function blacklistToken(
    decryptedToken: string,
    expiryInSeconds = 30
): Promise<void> {
    try {
        await blacklistTokenUtil(decryptedToken, expiryInSeconds);
    } catch (err) {
        logger.error("BLACKLIST ERROR:", err);
        throw err;
    }
}

/**
 * Send password reset email
 * @param to - Recipient email address
 * @param resetLink - Password reset link
 * @returns Nodemailer send result
 * @throws Error if email configuration is missing or sending fails
 */
export async function sendPasswordResetEmail(
    to: string,
    resetLink: string
): Promise<nodemailer.SentMessageInfo> {
    // Validate environment variables
    if (!config.myEmail || !config.myPassword) {
        logger.error(
            "Nodemailer configuration error: MY_EMAIL or MY_PASSWORD environment variables are missing"
        );
        throw new Error(
            "Email service configuration is missing. Please contact support."
        );
    }

    try {
        const transporter: Transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.myEmail,
                pass: config.myPassword,
            },
            tls: { rejectUnauthorized: false },
        });

        // Verify transporter configuration
        await transporter.verify();

        const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #0056b3; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your account.</p>
            <p><strong>Important:</strong> This link will expire in 30 minutes for security reasons.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetLink}</p>
            <div class="footer">
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const mailOptions: SendMailOptions = {
            from: config.myEmail,
            to,
            subject: "Password Reset Request",
            text: `You requested a password reset. It has a short expiry time (30 minutes) so hurry up! Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(
            `Password reset email sent successfully to ${to}. MessageId: ${info.messageId}`
        );
        return info;
    } catch (error: unknown) {
        const err = error as Error;
        logger.error("Error sending password reset email:", {
            to,
            error: err.message,
            stack: err.stack,
        });
        throw new Error(
            "Failed to send password reset email. Please try again later."
        );
    }
}

