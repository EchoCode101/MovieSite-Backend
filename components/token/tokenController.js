import jwt from "jsonwebtoken";
import pool from "../../db/db.js"; // Ensure you have a proper db connection
import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import {
  verifyRefreshToken,
  extractToken,
  verifyAccessToken,
  generateAccessToken,
} from "../Utilities/tokenUtils.js";
// Refresh token route to generate a new access token
export const refreshToken = async (req, res) => {
  const token = extractToken(req); // Extract token using the utility

  try {
    const decryptedToken = await decrypt(token);

    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [decryptedToken]
    );
    if (result.rows.length > 0) {
      return res.status(403).send("Refresh token has been revoked");
    }
    // Verify the refresh token
    const user = verifyRefreshToken(decryptedToken);

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // Encrypt the new access token before sending it
    const encryptedAccessToken = await encrypt(accessToken);
    res.json({ token: encryptedAccessToken });
  } catch (error) {
    console.error("Error in refresh token logic:", error.message);
    res.status(403).send("Invalid Refresh Token Format");
  }
};

export const validateToken = async (req, res, next) => {
  try {
    const token = extractToken(req); // Extract token using the utility
    const decryptedToken = await decrypt(token);
    const decoded = verifyAccessToken(decryptedToken);
    if (!decoded) {
      return res.status(401).json({ isValid: false });
    }
    res.json({ isValid: true, user: decoded });
  } catch (error) {
    console.error("Error in validateToken middleware:", error.message);
    res.status(403).send("Invalid token format or verification failed");
  }
};
