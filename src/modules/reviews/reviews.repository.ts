import { Types, type PipelineStage } from "mongoose";
import { ReviewModel, type Review } from "../../models/review.model.js";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  PaginatedReviewsParams,
  RecentReviewsParams,
  ReviewWithStats,
  ReviewWithUser,
} from "./reviews.types.js";

export class ReviewsRepository {
  /**
   * Find all reviews with populated user
   */
  async findAll(): Promise<ReviewWithUser[]> {
    return (await ReviewModel.find()
      .sort({ createdAt: -1 })
      .populate("member_id", "username first_name last_name")
      .exec()) as unknown as ReviewWithUser[];
  }

  /**
   * Find reviews by target type and ID
   */
  async findByTarget(targetType: "video" | "movie" | "tvshow" | "episode", targetId: string): Promise<ReviewWithUser[]> {
    // Convert targetId to ObjectId if it's a valid ObjectId string
    const targetObjectId = Types.ObjectId.isValid(targetId)
      ? new Types.ObjectId(targetId)
      : targetId;

    return (await ReviewModel.find({ target_type: targetType, target_id: targetObjectId })
      .sort({ createdAt: -1 })
      .populate("member_id", "username email first_name last_name profile_pic")
      .lean()
      .exec()) as unknown as ReviewWithUser[];
  }

  /**
   * Find recent reviews within date range
   */
  async findRecent(params: RecentReviewsParams): Promise<ReviewWithUser[]> {
    const query: Record<string, unknown> = {};
    if (params.startDate && params.endDate) {
      query.createdAt = {
        $gte: new Date(params.startDate),
        $lte: new Date(params.endDate),
      };
    }

    return (await ReviewModel.find(query)
      .sort({ createdAt: -1 })
      .populate("member_id", "username first_name last_name")
      .exec()) as unknown as ReviewWithUser[];
  }

  /**
   * Find paginated reviews with stats
   */
  async findPaginated(
    params: PaginatedReviewsParams
  ): Promise<{ reviews: ReviewWithStats[]; totalItems: number }> {
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

    // Build aggregation pipeline (similar to comments)
    const pipeline: PipelineStage[] = [
      // Match by target if provided
      ...(target_type && target_id ? [{
        $match: {
          target_type: target_type,
          target_id: new Types.ObjectId(target_id),
        },
      }] : []),
      {
        $lookup: {
          from: "likesdislikes",
          let: { reviewId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$reviewId"] },
                    { $eq: ["$target_type", "review"] },
                    { $eq: ["$is_like", true] },
                  ],
                },
              },
            },
          ],
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "likesdislikes",
          let: { reviewId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$reviewId"] },
                    { $eq: ["$target_type", "review"] },
                    { $eq: ["$is_like", false] },
                  ],
                },
              },
            },
          ],
          as: "dislikes",
        },
      },
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
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          review_content: 1,
          rating: 1,
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

    let sortField = sort;
    if (sort === "likes") {
      sortField = "likesCount";
    } else if (sort === "dislikes") {
      sortField = "dislikesCount";
    } else if (sort === "review_id") {
      sortField = "_id";
    }

    pipeline.push({ $sort: { [sortField as string]: sortOrder } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    const countPipeline = [
      ...pipeline.slice(0, -2),
      { $count: "total" },
    ];
    const countResult = await ReviewModel.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    const reviews = (await ReviewModel.aggregate(pipeline)) as ReviewWithStats[];

    return { reviews, totalItems };
  }

  /**
   * Find review by target and member (for duplicate check)
   */
  async findByTargetAndMember(
    targetType: "video" | "movie" | "tvshow" | "episode",
    targetId: string,
    memberId: string
  ): Promise<Review | null> {
    return await ReviewModel.findOne({
      target_type: targetType,
      target_id: targetId,
      member_id: memberId,
    }).exec();
  }

  /**
   * Create a new review
   */
  async create(
    data: CreateReviewInput & { member_id: string }
  ): Promise<Review> {
    return await ReviewModel.create({
      target_type: data.target_type,
      target_id: data.target_id,
      member_id: data.member_id,
      rating: data.rating,
      review_content: data.content,
    });
  }

  /**
   * Update review by ID
   */
  async updateById(id: string, data: UpdateReviewInput): Promise<Review | null> {
    const updateData: Record<string, unknown> = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.content !== undefined) updateData.review_content = data.content;

    return await ReviewModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete review by ID
   */
  async deleteById(id: string): Promise<Review | null> {
    return await ReviewModel.findByIdAndDelete(id).exec();
  }

  /**
   * Find review by ID with populated user
   */
  async findById(id: string): Promise<ReviewWithUser | null> {
    return (await ReviewModel.findById(id)
      .populate("member_id", "username email first_name last_name profile_pic")
      .lean()
      .exec()) as unknown as ReviewWithUser | null;
  }

  /**
   * Find review by ID (for ownership checks)
   */
  async findByIdForOwnership(id: string): Promise<Review | null> {
    return await ReviewModel.findById(id).exec();
  }
}

