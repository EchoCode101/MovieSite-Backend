/**
 * Standardized API response format
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        message: string;
        stack?: string;
    };
}

/**
 * Auth-specific API response with tokens
 *
 * Used for login endpoints to return access + refresh tokens
 * along with the standard ApiResponse wrapper.
 */
export interface AuthApiResponse<T = unknown> extends ApiResponse<T> {
    token: string;
    refreshToken?: string;
}

