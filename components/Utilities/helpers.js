import { extractToken } from "../Utilities/tokenUtils.js";
import { TokenBlacklist } from "../../models/index.js";
import { decrypt } from "../Utilities/encryptionUtils.js";
import createError from "http-errors";
import nodemailer from "nodemailer";

export const extractAndDecryptToken = async (req) => {
  let token;

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

  return await decrypt(token); // Decrypt the token
};

export const blacklistTokenCheck = async (decryptedToken) => {
  return await TokenBlacklist.findOne({ token: decryptedToken });
};

export const blacklistToken = async (decryptedToken, expiryInSeconds = 30) => {
  // const expiryTime = new Date();
  // expiryTime.setSeconds(expiryTime.getSeconds() + expiryInSeconds);
  // await TokenBlacklist.create({
  //   token: decryptedToken,
  //   expires_at: expiryTime,
  // });
  try {
    //  const expiryTime = new Date();
    //  expiryTime.setSeconds(expiryTime.getSeconds() + expiryInSeconds);

    //  const doc = await TokenBlacklist.create({
    //    token: decryptedToken,
    //    expires_at: expiryTime,
    //  });

    //  console.log("BLACKLISTED:", doc);

    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + expiryInSeconds);

    await TokenBlacklist.updateOne(
      { token: decryptedToken },
      { $set: { expires_at: expiryTime } },
      { upsert: true }
    );
  } catch (err) {
    console.error("BLACKLIST ERROR:", err);
  }
};

export const sendPasswordResetEmail = async (to, resetLink) => {
  // Validate environment variables
  if (!process.env.MY_EMAIL || !process.env.MY_PASSWORD) {
    logger.error(
      "Nodemailer configuration error: MY_EMAIL or MY_PASSWORD environment variables are missing"
    );
    throw new Error(
      "Email service configuration is missing. Please contact support."
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
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

    const mailOptions = {
      from: process.env.MY_EMAIL,
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
  } catch (error) {
    logger.error("Error sending password reset email:", {
      to,
      error: error.message,
      stack: error.stack,
    });
    throw new Error(
      "Failed to send password reset email. Please try again later."
    );
  }
};
