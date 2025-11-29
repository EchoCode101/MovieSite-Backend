import type { Video } from "../../models/video.model.js";
import type { Member } from "../../models/member.model.js";

/**
 * Search type
 */
export type SearchType = "all" | "video" | "movie" | "tvshow" | "episode" | "season" | "user";

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
 * Movie search result
 */
export interface MovieSearchResult {
    _id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    poster_url?: string;
    release_date?: Date;
    imdb_rating?: number;
    createdAt: Date;
}

/**
 * TV Show search result
 */
export interface TvShowSearchResult {
    _id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    poster_url?: string;
    release_year?: number;
    imdb_rating?: number;
    createdAt: Date;
}

/**
 * Episode search result
 */
export interface EpisodeSearchResult {
    _id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    episode_number: number;
    season_number?: number;
    tv_show_title?: string;
    createdAt: Date;
}

/**
 * Season search result
 */
export interface SeasonSearchResult {
    _id: string;
    name?: string;
    season_number: number;
    tv_show_title?: string;
    release_date?: Date;
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
    movies: MovieSearchResult[];
    movieCount: number;
    tvShows: TvShowSearchResult[];
    tvShowCount: number;
    episodes: EpisodeSearchResult[];
    episodeCount: number;
    seasons: SeasonSearchResult[];
    seasonCount: number;
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
    results: VideoSearchResult[] | MovieSearchResult[] | TvShowSearchResult[] | EpisodeSearchResult[] | SeasonSearchResult[] | UserSearchResult[] | AllSearchResults;
}

