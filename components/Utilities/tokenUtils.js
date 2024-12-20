// tokenUtils.js
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
      id: user.member_id || user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY_TIME }
  );
};

// Generate a new refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.member_id || user.id,
      email: user.email,
      username: user.username,
      role: user.role,
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
    throw new Error("Invalid or expired access token");
  }
};

// Verify and decode a refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};
// Utility to extract token from Authorization header
export const extractToken = (req) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    throw new Error("Access token required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Access token missing");
  }

  return token;
};
