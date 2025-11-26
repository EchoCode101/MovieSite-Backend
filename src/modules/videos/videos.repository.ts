import type { Types, PipelineStage } from "mongoose";
import { VideoModel, type Video } from "../../models/video.model.js";
import type {
    CreateVideoInput,
    UpdateVideoInput,
    PaginatedVideosParams,
    VideoWithStats,
    VideoWithLikesDislikes,
} from "./videos.types.js";

export class VideosRepository {
    /**
     * Find all videos (admin only)
     */
    async findAll(): Promise<Video[]> {
        return await VideoModel.find().sort({ updatedAt: -1 }).exec();
    }

    /**
     * Find video by ID
     */
    async findById(id: string): Promise<Video | null> {
        return await VideoModel.findById(id).exec();
    }

    /**
     * Find paginated videos with metrics, likes/dislikes, and ratings
     */
    async findPaginated(
        params: PaginatedVideosParams
    ): Promise<{ videos: VideoWithStats[]; totalItems: number }> {
        const {
            page = 1,
            limit = 10,
            sort = "updatedAt",
            order = "DESC",
        } = params;

        const skip = (Number(page) - 1) * Number(limit);
        const sortOrder = order === "ASC" ? 1 : -1;

        // Build aggregation pipeline
        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: "videometrics",
                    localField: "_id",
                    foreignField: "video_id",
                    as: "metrics",
                },
            },
            {
                $unwind: {
                    path: "$metrics",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "likesdislikes",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$target_id", "$$videoId"] },
                                        { $eq: ["$target_type", "video"] },
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
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$target_id", "$$videoId"] },
                                        { $eq: ["$target_type", "video"] },
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
                    from: "reviewsandratings",
                    localField: "_id",
                    foreignField: "video_id",
                    as: "reviews",
                },
            },
            {
                $addFields: {
                    likes_count: { $size: "$likes" },
                    dislikes_count: { $size: "$dislikes" },
                    average_rating: {
                        $cond: {
                            if: { $gt: [{ $size: "$reviews" }, 0] },
                            then: { $round: [{ $avg: "$reviews.rating" }, 1] },
                            else: null,
                        },
                    },
                },
            },
        ];

        // Add sorting
        let sortField = sort;
        if (sort === "views_count") {
            sortField = "metrics.views_count";
        } else if (sort === "likes.length") {
            sortField = "likes_count";
        } else if (sort === "dislikes.length") {
            sortField = "dislikes_count";
        } else if (sort === "rating") {
            sortField = "average_rating";
        } else if (sort === "video_id") {
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
        const countResult = await VideoModel.aggregate(countPipeline);
        const totalItems = countResult[0]?.total || 0;

        // Get videos
        const videos = (await VideoModel.aggregate(pipeline)) as VideoWithStats[];

        return { videos, totalItems };
    }

    /**
     * Find videos with likes/dislikes and member information (admin analytics)
     */
    async findWithLikesDislikes(): Promise<VideoWithLikesDislikes[]> {
        const videos = (await VideoModel.aggregate([
            {
                $lookup: {
                    from: "likesdislikes",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$target_id", "$$videoId"] },
                                        { $eq: ["$target_type", "video"] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "members",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        {
                            $unwind: {
                                path: "$user",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                is_like: 1,
                                user: {
                                    _id: "$user._id",
                                    first_name: "$user.first_name",
                                    last_name: "$user.last_name",
                                },
                            },
                        },
                    ],
                    as: "likesDislikes",
                },
            },
            {
                $addFields: {
                    likes: {
                        $size: {
                            $filter: {
                                input: "$likesDislikes",
                                as: "item",
                                cond: { $eq: ["$$item.is_like", true] },
                            },
                        },
                    },
                    dislikes: {
                        $size: {
                            $filter: {
                                input: "$likesDislikes",
                                as: "item",
                                cond: { $eq: ["$$item.is_like", false] },
                            },
                        },
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ])) as VideoWithLikesDislikes[];

        return videos;
    }

    /**
     * Create a new video
     */
    async create(data: CreateVideoInput & { created_by?: Types.ObjectId }): Promise<Video> {
        const video = await VideoModel.create(data);
        return video;
    }

    /**
     * Update video by ID
     */
    async updateById(id: string, data: UpdateVideoInput): Promise<Video | null> {
        return await VideoModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    }

    /**
     * Delete video by ID
     */
    async deleteById(id: string): Promise<Video | null> {
        return await VideoModel.findByIdAndDelete(id).exec();
    }

    /**
     * Bulk delete videos
     */
    async bulkDelete(
        ids: string[],
        userId?: string,
        isAdmin = false
    ): Promise<{ deletedCount: number }> {
        const query: Record<string, unknown> = { _id: { $in: ids } };
        if (!isAdmin && userId) {
            query.created_by = userId;
        }

        const result = await VideoModel.deleteMany(query).exec();
        return { deletedCount: result.deletedCount || 0 };
    }
}

