import type { Video } from "../../models/video.model.js";
import type { Types } from "mongoose";

/**
 * Base video document interface (extends model)
 */
export interface VideoDocument extends Video { }

/**
 * Video with aggregated statistics
 */
export interface VideoWithStats extends Video {
    metrics?: {
        views_count?: number;
        shares_count?: number;
        favorites_count?: number;
        reports_count?: number;
    };
    likes_count?: number;
    dislikes_count?: number;
    average_rating?: number | null;
    reviews?: Array<{
        _id: Types.ObjectId;
        rating: number;
        content: string;
    }>;
}

/**
 * Video with likes/dislikes and member information (for admin analytics)
 */
export interface VideoWithLikesDislikes extends Video {
    likesDislikes?: Array<{
        is_like: boolean;
        user: {
            _id: Types.ObjectId;
            first_name?: string;
            last_name?: string;
        };
    }>;
    likes?: number;
    dislikes?: number;
}

/**
 * Pagination query parameters
 */
export interface PaginatedVideosParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "ASC" | "DESC";
}

/**
 * Paginated videos response
 */
export interface PaginatedVideosResponse {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    videos: VideoWithStats[];
}

/**
 * Input for creating a new video
 */
export interface CreateVideoInput {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    duration?: number;
    resolution?: string;
    file_size?: number;
    category?: string;
    language?: string;
    age_restriction?: boolean;
    published?: boolean;
    seo_title?: string;
    seo_description?: string;
    license_type?: string;
    access_level?: string;
    video_format?: string;
    tags?: string[];
    gallery?: string[];
}

/**
 * Input for updating a video
 */
export interface UpdateVideoInput {
    title?: string;
    description?: string;
    video_url?: string;
    thumbnail_url?: string;
    duration?: number;
    resolution?: string;
    file_size?: number;
    category?: string;
    language?: string;
    age_restriction?: boolean;
    published?: boolean;
    seo_title?: string;
    seo_description?: string;
    license_type?: string;
    access_level?: string;
    video_format?: string;
    tags?: string[];
    gallery?: string[];
}

/**
 * Cloudinary upload result
 */
export interface VideoUploadResult {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    bytes?: number;
}

/**
 * Bulk delete input
 */
export interface BulkDeleteVideosInput {
    ids: string[];
}

