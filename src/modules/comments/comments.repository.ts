import type { Types, PipelineStage } from "mongoose";
import { CommentModel, type Comment } from "../../models/comment.model.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
  PaginatedCommentsParams,
  CommentWithStats,
  CommentWithUser,
} from "./comments.types.js";

export class CommentsRepository {
  /**
   * Find all comments with populated user and video (admin)
   */
  async findAll(): Promise<CommentWithUser[]> {
    return (await CommentModel.find()
      .sort({ createdAt: -1 })
      .populate("member_id", "first_name last_name")
      .populate("video_id", "title description thumbnail_url")
      .exec()) as unknown as CommentWithUser[];
  }

  /**
   * Find comment by ID with populated user and video
   */
  async findById(id: string): Promise<CommentWithUser | null> {
    return (await CommentModel.findById(id)
      .populate("member_id", "first_name last_name")
      .populate("video_id", "title description thumbnail_url")
      .exec()) as unknown as CommentWithUser | null;
  }

  /**
   * Find comments by video ID
   */
  async findByVideoId(videoId: string): Promise<CommentWithUser[]> {
    return (await CommentModel.find({ video_id: videoId })
      .sort({ createdAt: -1 })
      .populate("member_id", "first_name last_name username avatar_url")
      .lean()
      .exec()) as unknown as CommentWithUser[];
  }

  /**
   * Find paginated comments with stats
   */
  async findPaginated(
    params: PaginatedCommentsParams
  ): Promise<{ comments: CommentWithStats[]; totalItems: number }> {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline
    const pipeline: PipelineStage[] = [
      // Lookup likes
      {
        $lookup: {
          from: "likesdislikes",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$commentId"] },
                    { $eq: ["$target_type", "comment"] },
                    { $eq: ["$is_like", true] },
                  ],
                },
              },
            },
          ],
          as: "likes",
        },
      },
      // Lookup dislikes
      {
        $lookup: {
          from: "likesdislikes",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$commentId"] },
                    { $eq: ["$target_type", "comment"] },
                    { $eq: ["$is_like", false] },
                  ],
                },
              },
            },
          ],
          as: "dislikes",
        },
      },
      // Populate member
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      // Populate video
      {
        $lookup: {
          from: "videos",
          localField: "video_id",
          foreignField: "_id",
          as: "video",
        },
      },
      // Add computed fields
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
          video: { $arrayElemAt: ["$video", 0] },
        },
      },
      // Project fields
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          likesCount: 1,
          dislikesCount: 1,
          member: {
            _id: "$member._id",
            first_name: "$member.first_name",
            last_name: "$member.last_name",
          },
          video: {
            _id: "$video._id",
            title: "$video.title",
            description: "$video.description",
            thumbnail_url: "$video.thumbnail_url",
          },
        },
      },
    ];

    // Add sorting
    let sortField = sort;
    if (sort === "likes") {
      sortField = "likesCount";
    } else if (sort === "dislikes") {
      sortField = "dislikesCount";
    } else if (sort === "comment_id") {
      sortField = "_id";
    }

    pipeline.push({ $sort: { [sortField as string]: sortOrder } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    // Get total count
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove skip and limit
      { $count: "total" },
    ];
    const countResult = await CommentModel.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Get comments
    const comments = (await CommentModel.aggregate(pipeline)) as CommentWithStats[];

    return { comments, totalItems };
  }

  /**
   * Create a new comment
   */
  async create(
    data: CreateCommentInput & { member_id: string }
  ): Promise<Comment> {
    const comment = await CommentModel.create({
      video_id: data.video_id,
      member_id: data.member_id,
      content: data.content.trim(),
    });
    return comment;
  }

  /**
   * Update comment by ID
   */
  async updateById(id: string, data: UpdateCommentInput): Promise<Comment | null> {
    return await CommentModel.findByIdAndUpdate(
      id,
      { content: data.content.trim() },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete comment by ID
   */
  async deleteById(id: string): Promise<Comment | null> {
    return await CommentModel.findByIdAndDelete(id).exec();
  }

  /**
   * Find comment by ID (for ownership checks)
   */
  async findByIdForOwnership(id: string): Promise<Comment | null> {
    return await CommentModel.findById(id).exec();
  }

  /**
   * Bulk delete comments
   */
  async bulkDelete(
    ids: string[],
    userId?: string,
    isAdmin = false
  ): Promise<{ deletedCount: number }> {
    const query: Record<string, unknown> = { _id: { $in: ids } };
    if (!isAdmin && userId) {
      query.member_id = userId;
    }

    const result = await CommentModel.deleteMany(query).exec();
    return { deletedCount: result.deletedCount || 0 };
  }
}

