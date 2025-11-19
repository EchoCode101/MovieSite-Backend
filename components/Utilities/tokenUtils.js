// tokenUtils.js
import createError from "http-errors";
import jwt from "jsonwebtoken";
const {
  JWT_SECRET,
  REFRESH_SECRET,
  TOKEN_EXPIRY_TIME,
  REFRESH_TOKEN_EXPIRY_TIME,
} = process.env;

// Generate a new access token
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status || "active",
      lastLogin: user.lastLogin,
      profileImage: user.profileImage || user.profile_pic || null,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY_TIME }
  );
};

// Generate a new refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status || "active",
      lastLogin: user.lastLogin,
      profileImage: user.profileImage || user.profile_pic || null,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY_TIME }
  );
};

// Verify and decode an access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw createError(401, "Invalid or expired access token");
  }
};

// Verify and decode a refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    throw createError(401, "Invalid or expired refresh token");
  }
};
// Utility to extract token from Authorization header
export const extractToken = (req) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    throw createError(401, "Access token required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw createError(401, "Access token missing");
  }

  return token;
};
