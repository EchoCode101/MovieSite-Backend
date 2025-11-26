import type { LikeDislike } from "../../models/likeDislike.model.js";

/**
 * Target type for likes/dislikes
 */
export type TargetType = "video" | "comment" | "review" | "comment_reply";

/**
 * Input for creating/updating a like/dislike
 */
export interface LikeDislikeInput {
    target_id: string;
    target_type: TargetType;
    is_like: boolean;
}

/**
 * Like/dislike count result
 */
export interface LikesDislikesCount {
    likes: number;
    dislikes: number;
}

/**
 * User reaction result
 */
export interface UserReaction {
    hasReacted: boolean;
    isLike: boolean | null;
}

/**
 * Toggle result
 */
export interface ToggleResult {
    removed?: boolean;
    likeDislike?: LikeDislike;
}

