import rateLimit from "express-rate-limit";
import { decrypt } from "../Utilities/encryptionUtils.js";
import pool from "../../db/db.js";
import jwt from "jsonwebtoken";
import { extractToken } from "../Utilities/tokenUtils.js";
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req); // Extract token using the utility
    const decryptedToken = await decrypt(token);

    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [decryptedToken]
    );
    if (result.rows.length > 0) {
      return res.status(403).send("Token has been revoked");
    }

    jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid or expired token");
      }
      if (!user || !user.username || !user.email || !user.role || !user.id) {
        return res.status(400).send("Invalid token structure");
      }
      req.user = user;
      next();
    });
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

    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [decryptedToken]
    );
    if (result.rows.length > 0) {
      return res.status(403).send("Token has been revoked");
    }

    jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid or expired token");
      }
      if (!user) {
        return res.status(401).send("Unauthorized access");
      }
      // Check the role of the user
      if (user.role !== "admin") {
        return res.status(403).send("Access denied: Admins only");
      }
      if (!user || !user.username || !user.email || !user.role || !user.id) {
        return res.status(400).send("Invalid token structure");
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in authenticateToken middleware:", error.message);
    res.status(403).send("Invalid token format or verification failed");
  }
};
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Include rate limit info in response headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const tokenSecret = process.env.TOKEN_SECRECT;
// Generate a token with the encrypted URL
function generateToken(videoID) {
  return jwt.sign({ videoID }, tokenSecret, { expiresIn: "1h" });
}

// Validate the token on request
function verifyToken(token) {
  try {
    return jwt.verify(token, tokenSecret);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

export { authenticateToken, authenticateAdminToken };
