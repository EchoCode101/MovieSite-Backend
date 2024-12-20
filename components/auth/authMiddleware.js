import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../Utilities/tokenUtils.js";
import {
  extractAndDecryptToken,
  blacklistTokenCheck,
} from "../Utilities/helpers.js";
import logger from "../Utilities/logger.js";

const authenticateToken = async (req, res, next) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);
    const blacklistedToken = await blacklistTokenCheck(decryptedToken);

    if (blacklistedToken) {
      return next(createError(403, "Token has been revoked"));
    }
    const verifiedToken = verifyAccessToken(decryptedToken);
    req.user = verifiedToken;
    next();
  } catch (error) {
    logger.error("Error in authentication of Token middleware:", error);
    next(createError(403, "Invalid token format or verification failed"));
  }
};

// authenticateAdminToken middleware
const authenticateAdminToken = async (req, res, next) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);
    const blacklistedToken = await blacklistTokenCheck(decryptedToken);
    if (blacklistedToken) {
      return next(createError(403, "Token has been revoked"));
    }

    jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(createError(403, "Invalid or expired token"));
      }
      if (user.role !== "admin") {
        return res.status(403).send("Access denied: Admins only");
      }
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error("Error in authentication of Admin Token  middleware:", error);
    next(createError(403, "Invalid token format or verification failed"));
  }
};

// User-specific rate limiter
const limiter = rateLimit({
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

export { authenticateToken, authenticateAdminToken, limiter };
