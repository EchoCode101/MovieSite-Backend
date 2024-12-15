import rateLimit from "express-rate-limit";
import { decrypt } from "../Utilities/encryptionUtils.js";
import pool from "../../db/db.js";
import { TokenBlacklist } from "../../SequelizeSchemas/schemas.js";
import jwt from "jsonwebtoken";
import { extractToken, verifyAccessToken } from "../Utilities/tokenUtils.js";
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req); // Extract token using the utility
    const decryptedToken = await decrypt(token);

    const blacklistedToken = await TokenBlacklist.findOne({
      where: { token: decryptedToken },
    });
    if (blacklistedToken) {
      return res.status(403).send("Token has been revoked");
    }
    const decoded = verifyAccessToken(decryptedToken);
    if (!decoded) {
      return res.status(401).json({ isValid: false });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in authenticateToken middleware:", error.message);
    res.status(403).send("Invalid token format or verification failed");
  }
};

// authenticateAdminToken middleware
const authenticateAdminToken = async (req, res, next) => {
  try {
    const token = extractToken(req); // Extract token using the utility
    const decryptedToken = await decrypt(token);

    const blacklistedToken = await TokenBlacklist.findOne({
      where: { token: decryptedToken },
    });
    if (blacklistedToken) {
      return res.status(403).send("Token has been revoked");
    }

    jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid or expired token");
      }
      if (!user || !user.username || !user.email || !user.role || !user.id) {
        return res.status(400).send("Invalid token structure");
      }
      if (user.role !== "admin") {
        return res.status(403).send("Access denied: Admins only");
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(
      "Error in authenticate Admin Token middleware:",
      error.message
    );
    res.status(403).send("Invalid token format or verification failed");
  }
};

// User-specific rate limiter
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  keyGenerator: (req, res) => {
    // console.log(req.user, req.ip, req.email);
    // Use the authenticated user's ID/email, or fallback to IP address
    return req.user?.id || req.user?.email || req.ip;
  },
  standardHeaders: true, // Include rate limit info in response headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

export { authenticateToken, authenticateAdminToken };
