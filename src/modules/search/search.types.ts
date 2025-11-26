import type { Video } from "../../models/video.model.js";
import type { Member } from "../../models/member.model.js";

/**
 * Search type
 */
export type SearchType = "all" | "video" | "user";

/**
 * Search query parameters
 */
export interface SearchParams {
    q: string;
    type?: SearchType;
    page?: number;
    limit?: number;
}

/**
 * Video search result
 */
export interface VideoSearchResult {
    _id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    video_url?: string;
    views_count?: number;
    createdAt: Date;
}

/**
 * User search result
 */
export interface UserSearchResult {
    _id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
}

/**
 * Search results for "all" type
 */
export interface AllSearchResults {
    videos: VideoSearchResult[];
    videoCount: number;
    users: UserSearchResult[];
    userCount: number;
}

/**
 * Search response
 */
export interface SearchResponse {
    query: string;
    type: SearchType;
    page: number;
    limit: number;
    totalResults?: number;
    results: VideoSearchResult[] | UserSearchResult[] | AllSearchResults;
}

