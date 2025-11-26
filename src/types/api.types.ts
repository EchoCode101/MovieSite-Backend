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

