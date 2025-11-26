import createError from "http-errors";
import { encrypt } from "../../utils/encryption.js";
import { verifyRefreshToken, verifyAccessToken, generateAccessToken } from "../../utils/jwt.js";
import { blacklistTokenCheck, extractAndDecryptToken } from "../../utils/helpers.js";
import type { RefreshTokenResponse, ValidateTokenResponse } from "./token.types.js";
import type { JwtUserPayload } from "../auth/auth.types.js";

export class TokenService {
    /**
     * Refresh access token
     */
    async refreshToken(req: {
        path?: string;
        cookies?: { encryptedRefreshToken?: string };
        headers?: { authorization?: string };
    }): Promise<RefreshTokenResponse> {
        const decryptedToken = await extractAndDecryptToken(req as any);
        const isBlacklisted = await blacklistTokenCheck(decryptedToken);

        if (isBlacklisted) {
            throw createError(403, "Refresh token has been revoked");
        }

        // Verify the refresh token
        const user = verifyRefreshToken(decryptedToken);

        // Generate new access token
        const accessToken = generateAccessToken(user);

        // Encrypt the new access token before sending it
        const encryptedAccessToken = await encrypt(accessToken);

        return { token: encryptedAccessToken };
    }

    /**
     * Validate access token
     */
    async validateToken(req: {
        path?: string;
        cookies?: { encryptedAccessToken?: string };
        headers?: { authorization?: string };
    }): Promise<ValidateTokenResponse> {
        const decryptedToken = await extractAndDecryptToken(req as any);
        const decoded = verifyAccessToken(decryptedToken);

        if (!decoded) {
            throw createError(401, "Invalid or Expired Token");
        }

        return { isValid: true, user: decoded };
    }
}

