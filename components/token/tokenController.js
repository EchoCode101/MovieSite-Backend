import logger from "../Utilities/logger.js";
import { encrypt } from "../Utilities/encryptionUtils.js";
import {
  verifyRefreshToken,
  verifyAccessToken,
  generateAccessToken,
} from "../Utilities/tokenUtils.js";
import {
  blacklistTokenCheck,
  extractAndDecryptToken,
} from "../Utilities/helpers.js";
// Refresh token route to generate a new access token
export const refreshToken = async (req, res, next) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);
    const isBlacklisted = await blacklistTokenCheck(decryptedToken);

    if (isBlacklisted) {
      return next(createError(403, "Refresh token has been revoked"));
    }
    // Verify the refresh token
    const user = verifyRefreshToken(decryptedToken);

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // Encrypt the new access token before sending it
    const encryptedAccessToken = await encrypt(accessToken);
    res.json({ token: encryptedAccessToken });
  } catch (error) {
    logger.error("Error in refresh token logic:", error.message);
    next(createError(403, "Invalid Refresh Token Format"));
  }
};

export const validateToken = async (req, res, next) => {
  try {
    const decryptedToken = await extractAndDecryptToken(req);
    const decoded = verifyAccessToken(decryptedToken);
    if (!decoded) {
      return next(createError(401, "Invalid or Expired Token"));
    }
    res.json({ isValid: true, user: decoded });
  } catch (error) {
    logger.error("Error in validateToken middleware:", error.message);
    next(createError(403, "Invalid token format or verification failed"));
  }
};
