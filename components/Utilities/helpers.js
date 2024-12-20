import { extractToken } from "../Utilities/tokenUtils.js";
import { TokenBlacklist } from "../../models/index.js";
import { decrypt } from "../Utilities/encryptionUtils.js";
import nodemailer from "nodemailer";

export const extractAndDecryptToken = async (req) => {
  const token = extractToken(req); // Extract token using the utility
  return await decrypt(token); // Decrypt the token
};

export const blacklistTokenCheck = async (decryptedToken) => {
  await TokenBlacklist.findOne({
    where: { token: decryptedToken },
  });
};

export const blacklistToken = async (decryptedToken, expiryInSeconds = 30) => {
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + expiryInSeconds);
  await TokenBlacklist.create({
    token: decryptedToken,
    expires_at: expiryTime,
  });
};

export const sendPasswordResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: process.env.MY_EMAIL,
    to,
    subject: "Password Reset Request",
    text: `You requested a password reset. It has a short expiry time so hurry up! Click the link below to reset your password:\n\n${resetLink}`,
  });
};
