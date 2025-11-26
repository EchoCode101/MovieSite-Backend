import type { JwtUserPayload } from "../auth/auth.types.js";

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
    token: string;
}

/**
 * Validate token response
 */
export interface ValidateTokenResponse {
    isValid: boolean;
    user: JwtUserPayload;
}

