// tokenUtils.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

const { JWT_SECRET, REFRESH_SECRET } = process.env;

// Generate a new access token
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "30m" }
  );
};

// Generate a new refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
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
    return res.status(401).send("Access Denied");
    // throw new Error("Access token required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access token missing");
    // throw new Error("Access token missing");
  }

  return token;
};
