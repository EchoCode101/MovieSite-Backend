import createError from "http-errors";
import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../modules/auth/auth.types.js";
import config from "../config/env.js";


// Type assertions after validation
const jwtSecret: string = config.jwtSecret;
const refreshSecret: string = config.refreshTokenSecret;
const tokenExpiryTime: string = config.tokenExpiryTime;
const refreshTokenExpiryTime: string = config.refreshTokenExpiryTime;


if (!jwtSecret) {
  throw new Error("jwtSecret environment variable is required");
}

if (!refreshSecret) {
  throw new Error("refreshSecret environment variable is required");
}
if (!tokenExpiryTime) {
  throw new Error("tokenExpiryTime environment variable is required");
}
if (!refreshTokenExpiryTime) {
  throw new Error("refreshTokenExpiryTime environment variable is required");
}

/**
 * User data that can be used to generate tokens
 */
export interface TokenUserData {
  _id?: string | unknown;
  id?: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status?: string | boolean;
  lastLogin?: Date;
  profileImage?: string | null;
  profile_pic?: string | null;
}

/**
 * Generate a new access token
 * @param user - User data to encode in token
 * @returns JWT access token
 */
export function generateAccessToken(user: TokenUserData | JwtUserPayload): string {
  if (!tokenExpiryTime) {
    throw new Error("TOKEN_EXPIRY_TIME is not configured");
  }

  // Extract ID from various possible formats
  const userId = (user as TokenUserData)._id
    ? String((user as TokenUserData)._id)
    : (user as TokenUserData).id || (user as JwtUserPayload).id;

  // Convert status to string (handle boolean from Admin model)
  const statusValue: string = typeof (user as TokenUserData).status === "boolean"
    ? ((user as TokenUserData).status ? "active" : "inactive")
    : (String((user as TokenUserData).status || (user as JwtUserPayload).status || "active"));

  // Convert lastLogin to ISO string for JWT payload (must be JSON-serializable)
  const lastLoginValue = user.lastLogin
    ? (user.lastLogin instanceof Date ? user.lastLogin.toISOString() : String(user.lastLogin))
    : undefined;

  // Build JWT payload object - only include defined values
  const payload: Record<string, string> = {
    id: userId,
    email: user.email,
    username: user.username,
    role: user.role,
    status: statusValue,
  };

  // Add optional fields only if they exist
  if (user.first_name) payload.first_name = user.first_name;
  if (user.last_name) payload.last_name = user.last_name;
  if (lastLoginValue) payload.lastLogin = lastLoginValue;

  const profileImage = (user as TokenUserData).profileImage || (user as TokenUserData).profile_pic || (user as JwtUserPayload).profileImage;
  if (profileImage) payload.profileImage = profileImage;
  // console.log("payload for access token", payload, "jwtSecret: ", jwtSecret, "tokenExpiryTime: ", tokenExpiryTime);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, jwtSecret, { expiresIn: tokenExpiryTime });
}

/**
 * Generate a new refresh token
 * @param user - User data to encode in token
 * @returns JWT refresh token
 */
export function generateRefreshToken(user: TokenUserData | JwtUserPayload): string {
  if (!refreshTokenExpiryTime) {
    throw new Error("REFRESH_TOKEN_EXPIRY_TIME is not configured");
  }

  // Extract ID from various possible formats
  const userId = (user as TokenUserData)._id
    ? String((user as TokenUserData)._id)
    : (user as TokenUserData).id || (user as JwtUserPayload).id;

  // Convert status to string (handle boolean from Admin model)
  const statusValue: string = typeof (user as TokenUserData).status === "boolean"
    ? ((user as TokenUserData).status ? "active" : "inactive")
    : (String((user as TokenUserData).status || (user as JwtUserPayload).status || "active"));

  // Convert lastLogin to ISO string for JWT payload (must be JSON-serializable)
  const lastLoginValue = user.lastLogin
    ? (user.lastLogin instanceof Date ? user.lastLogin.toISOString() : String(user.lastLogin))
    : undefined;

  // Build JWT payload object - only include defined values
  const payload: Record<string, string> = {
    id: userId,
    email: user.email,
    username: user.username,
    role: user.role,
    status: statusValue,
  };

  // Add optional fields only if they exist
  if (user.first_name) payload.first_name = user.first_name;
  if (user.last_name) payload.last_name = user.last_name;
  if (lastLoginValue) payload.lastLogin = lastLoginValue;

  const profileImage = (user as TokenUserData).profileImage || (user as TokenUserData).profile_pic || (user as JwtUserPayload).profileImage;
  if (profileImage) payload.profileImage = profileImage;
  // console.log("payload for refresh token", payload, "refreshSecret: ", refreshSecret, "refreshTokenExpiryTime: ", refreshTokenExpiryTime);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, refreshSecret, { expiresIn: refreshTokenExpiryTime });
}

/**
 * Verify and decode an access token
 * @param token - JWT access token
 * @returns Decoded token payload
 * @throws HttpError if token is invalid or expired
 */
export function verifyAccessToken(token: string): JwtUserPayload {
  try {
    return jwt.verify(token, jwtSecret) as JwtUserPayload;
  } catch (err) {
    throw createError(401, "Invalid or expired access token");
  }
}

/**
 * Verify and decode a refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload
 * @throws HttpError if token is invalid or expired
 */
export function verifyRefreshToken(token: string): JwtUserPayload {
  try {
    return jwt.verify(token, refreshSecret) as JwtUserPayload;
  } catch (err) {
    throw createError(401, "Invalid or expired refresh token");
  }
}

/**
 * Extract token from Authorization header
 * @param req - Express request object
 * @returns Token string
 * @throws HttpError if token is missing
 */
export function extractToken(req: { headers: { authorization?: string } }): string {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    throw createError(401, "Access token required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw createError(401, "Access token missing");
  }

  return token;
}


