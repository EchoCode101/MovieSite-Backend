import { Types, type PipelineStage } from "mongoose";
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
   * Find all comments with populated user and target (admin)
   */
  async findAll(): Promise<CommentWithUser[]> {
    return (await CommentModel.find()
      .sort({ createdAt: -1 })
      .populate("member_id", "first_name last_name username avatar_url")
      .exec()) as unknown as CommentWithUser[];
  }

  /**
   * Find comment by ID with populated user
   */
  async findById(id: string): Promise<CommentWithUser | null> {
    return (await CommentModel.findById(id)
      .populate("member_id", "first_name last_name username avatar_url profile_pic")
      .lean()
      .exec()) as unknown as CommentWithUser | null;
  }

  /**
   * Find comments by target type and ID
   */
  async findByTarget(targetType: "video" | "movie" | "tvshow" | "episode", targetId: string): Promise<CommentWithUser[]> {
    // Convert targetId to ObjectId if it's a valid ObjectId string
    const targetObjectId = Types.ObjectId.isValid(targetId)
      ? new Types.ObjectId(targetId)
      : targetId;

    return (await CommentModel.find({ target_type: targetType, target_id: targetObjectId })
      .sort({ createdAt: -1 })
      .populate("member_id", "first_name last_name username avatar_url profile_pic")
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
      target_type,
      target_id,
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline
    const pipeline: PipelineStage[] = [
      // Match by target if provided
      ...(target_type && target_id ? [{
        $match: {
          target_type: target_type,
          target_id: new Types.ObjectId(target_id),
        },
      }] : []),
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
      // Lookup target based on target_type
      {
        $lookup: {
          from: "videos",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "video"] },
                  ],
                },
              },
            },
          ],
          as: "videoTarget",
        },
      },
      {
        $lookup: {
          from: "movies",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "movie"] },
                  ],
                },
              },
            },
          ],
          as: "movieTarget",
        },
      },
      {
        $lookup: {
          from: "tvshows",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "tvshow"] },
                  ],
                },
              },
            },
          ],
          as: "tvshowTarget",
        },
      },
      {
        $lookup: {
          from: "episodes",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "episode"] },
                  ],
                },
              },
            },
          ],
          as: "episodeTarget",
        },
      },
      // Combine all targets into one field
      {
        $addFields: {
          target: {
            $cond: {
              if: { $gt: [{ $size: "$videoTarget" }, 0] },
              then: { $arrayElemAt: ["$videoTarget", 0] },
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$movieTarget" }, 0] },
                  then: { $arrayElemAt: ["$movieTarget", 0] },
                  else: {
                    $cond: {
                      if: { $gt: [{ $size: "$tvshowTarget" }, 0] },
                      then: { $arrayElemAt: ["$tvshowTarget", 0] },
                      else: { $arrayElemAt: ["$episodeTarget", 0] },
                    },
                  },
                },
              },
            },
          },
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
          target: {
            _id: "$target._id",
            title: { $ifNull: ["$target.title", "$target.name"] },
            description: "$target.description",
            thumbnail_url: "$target.thumbnail_url",
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
      target_type: data.target_type,
      target_id: data.target_id,
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

  /**
   * Find user's comments with pagination
   */
  async findUserComments(
    userId: string,
    params: PaginatedCommentsParams
  ): Promise<{ comments: CommentWithStats[]; totalItems: number }> {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
      target_type,
      target_id,
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline similar to findPaginated but filter by member_id
    const pipeline: PipelineStage[] = [
      // Match by user and optionally by target
      {
        $match: {
          member_id: new Types.ObjectId(userId),
          ...(target_type && target_id
            ? {
                target_type: target_type,
                target_id: new Types.ObjectId(target_id),
              }
            : {}),
        },
      },
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
      // Lookup target based on target_type
      {
        $lookup: {
          from: "videos",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "video"] },
                  ],
                },
              },
            },
          ],
          as: "videoTarget",
        },
      },
      {
        $lookup: {
          from: "movies",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "movie"] },
                  ],
                },
              },
            },
          ],
          as: "movieTarget",
        },
      },
      {
        $lookup: {
          from: "tvshows",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "tvshow"] },
                  ],
                },
              },
            },
          ],
          as: "tvshowTarget",
        },
      },
      {
        $lookup: {
          from: "episodes",
          let: { targetId: "$target_id", targetType: "$target_type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$targetId"] },
                    { $eq: ["$$targetType", "episode"] },
                  ],
                },
              },
            },
          ],
          as: "episodeTarget",
        },
      },
      // Combine all targets into one field
      {
        $addFields: {
          target: {
            $cond: {
              if: { $gt: [{ $size: "$videoTarget" }, 0] },
              then: { $arrayElemAt: ["$videoTarget", 0] },
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$movieTarget" }, 0] },
                  then: { $arrayElemAt: ["$movieTarget", 0] },
                  else: {
                    $cond: {
                      if: { $gt: [{ $size: "$tvshowTarget" }, 0] },
                      then: { $arrayElemAt: ["$tvshowTarget", 0] },
                      else: { $arrayElemAt: ["$episodeTarget", 0] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Add computed fields
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
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
          target: {
            _id: "$target._id",
            title: { $ifNull: ["$target.title", "$target.name"] },
            description: "$target.description",
            thumbnail_url: "$target.thumbnail_url",
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
}

