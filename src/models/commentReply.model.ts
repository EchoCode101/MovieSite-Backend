import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface CommentReply extends Document {
    comment_id: Types.ObjectId;
    member_id: Types.ObjectId;
    reply_content: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentReplySchema = new Schema<CommentReply>(
    {
        comment_id: {
            type: Schema.Types.ObjectId,
            ref: "Comments",
            required: true,
        },
        member_id: {
            type: Schema.Types.ObjectId,
            ref: "Members",
            required: true,
        },
        reply_content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "commentreplies",
    },
);

commentReplySchema.index({ comment_id: 1 });
commentReplySchema.index({ member_id: 1 });
commentReplySchema.index({ createdAt: -1 });

export const CommentReplyModel = mongoose.model<CommentReply>("CommentReplies", commentReplySchema);

