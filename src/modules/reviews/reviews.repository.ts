import type { Types, PipelineStage } from "mongoose";
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
   * Find all reviews with populated user and video
   */
  async findAll(): Promise<ReviewWithUser[]> {
    return (await ReviewModel.find()
      .sort({ createdAt: -1 })
      .populate("video_id", "title")
      .populate("member_id", "username first_name last_name")
      .exec()) as unknown as ReviewWithUser[];
  }

  /**
   * Find reviews by video ID
   */
  async findByVideoId(videoId: string): Promise<ReviewWithUser[]> {
    return (await ReviewModel.find({ video_id: videoId })
      .sort({ createdAt: -1 })
      .populate("video_id", "title category")
      .populate("member_id", "username email first_name last_name")
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
      .populate("video_id", "title")
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
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline (similar to comments)
    const pipeline: PipelineStage[] = [
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
      {
        $lookup: {
          from: "videos",
          localField: "video_id",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
          video: { $arrayElemAt: ["$video", 0] },
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
          video: {
            _id: "$video._id",
            title: "$video.title",
            description: "$video.description",
            thumbnail_url: "$video.thumbnail_url",
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
   * Find review by video and member (for duplicate check)
   */
  async findByVideoAndMember(
    videoId: string,
    memberId: string
  ): Promise<Review | null> {
    return await ReviewModel.findOne({
      video_id: videoId,
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
      video_id: data.video_id,
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
   * Find review by ID (for ownership checks)
   */
  async findByIdForOwnership(id: string): Promise<Review | null> {
    return await ReviewModel.findById(id).exec();
  }
}

