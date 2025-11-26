import type { CommentReply } from "../../models/commentReply.model.js";
import type { Types } from "mongoose";

/**
 * Comment reply with user information
 */
export interface CommentReplyWithUser extends Omit<CommentReply, "member_id"> {
    member_id: {
        _id: Types.ObjectId;
        username?: string;
        first_name?: string;
        last_name?: string;
        profile_pic?: string;
    };
}

/**
 * Input for creating a reply
 */
export interface CreateReplyInput {
    comment_id: string;
    reply_content: string;
}

/**
 * Input for updating a reply
 */
export interface UpdateReplyInput {
    reply_content: string;
}

