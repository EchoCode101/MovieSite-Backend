import { Types, type PipelineStage } from "mongoose";
import { MovieModel, type Movie } from "../../models/movie.model.js";
import type {
  CreateMovieInput,
  UpdateMovieInput,
  PaginatedMoviesParams,
  MovieWithStats,
} from "./movies.types.js";
import config from "../../config/env.js";

export class MoviesRepository {
  async findAll(): Promise<Movie[]> {
    return MovieModel.find({ deleted_at: null })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Movie | null> {
    return MovieModel.findOne({ _id: id, deleted_at: null }).exec();
  }

  async findBySlug(slug: string): Promise<Movie | null> {
    return MovieModel.findOne({ slug, deleted_at: null }).exec();
  }

  async findPaginated(
    params: PaginatedMoviesParams,
    userId?: string,
  ): Promise<{ movies: MovieWithStats[]; totalItems: number }> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "DESC",
      genre,
      year,
      access_type,
      is_featured,
      is_trending,
      is_coming_soon,
      search,
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build match stage
    const matchStage: any = { deleted_at: null, status: "published" };

    if (genre && genre !== "All" && genre.trim() !== "") {
      matchStage.genres = new Types.ObjectId(genre);
    }

    // Filter by year (extract from release_date)
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
      matchStage.release_date = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
    }

    if (access_type) {
      matchStage.access_type = access_type;
    }

    if (is_featured !== undefined) {
      matchStage.is_featured = is_featured;
    }

    if (is_trending !== undefined) {
      matchStage.is_trending = is_trending;
    }

    if (is_coming_soon !== undefined) {
      matchStage.is_coming_soon = is_coming_soon;
    }

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build aggregation pipeline
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
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
          let: { movieId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$movieId"] },
                    { $eq: ["$target_type", "movie"] },
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
          let: { movieId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$movieId"] },
                    { $eq: ["$target_type", "movie"] },
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

    // Add access control filtering only if access control is enabled
    // Option A: Show all movies in catalog, restrict playback separately
    if (config.enableAccessControl) {
      if (userId) {
        const userIdObj = new Types.ObjectId(userId);
        
        // Lookup user document to check subscription_plan field
        pipeline.push({
          $lookup: {
            from: "members",
            let: {},
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", userIdObj],
                  },
                },
              },
              {
                $project: {
                  subscription_plan: 1,
                },
              },
            ],
            as: "user",
          },
        });

        // Lookup user's active subscription
        pipeline.push({
          $lookup: {
            from: "subscriptions",
            let: { moviePlanIds: "$plan_ids", userSubscriptionPlan: { $arrayElemAt: ["$user.subscription_plan", 0] } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", userIdObj] },
                      { $eq: ["$status", "active"] },
                      { $gt: ["$ends_at", new Date()] },
                    ],
                  },
                },
              },
              {
                $addFields: {
                  hasMatchingPlan: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: [{ $size: "$$moviePlanIds" }, 0] }, // No plan restriction - allow all
                          {
                            $gt: [
                              {
                                $size: {
                                  $filter: {
                                    input: "$$moviePlanIds",
                                    as: "planId",
                                    cond: { $eq: ["$$planId", "$plan_id"] },
                                  },
                                },
                              },
                              0,
                            ],
                          }, // User's plan_id is in movie's plan_ids
                        ],
                      },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
              {
                $match: {
                  hasMatchingPlan: true,
                },
              },
            ],
            as: "userSubscription",
          },
        });

        // Lookup user's PPV purchases
        pipeline.push({
          $lookup: {
            from: "payperviews",
            let: { movieId: "$_id", now: new Date() },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", userIdObj] },
                      { $eq: ["$target_type", "movie"] },
                      { $eq: ["$target_id", "$$movieId"] },
                      {
                        $or: [
                          { $eq: ["$purchase_type", "buy"] }, // Buy is permanent
                          {
                            $and: [
                              { $eq: ["$purchase_type", "rent"] },
                              {
                                $or: [
                                  { $eq: ["$expires_at", null] }, // No expiration set - assume valid
                                  { $gt: ["$expires_at", "$$now"] }, // Rent hasn't expired
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: "userPPVPurchase",
          },
        });

        // Filter based on access_type
        // This now also checks user's subscription_plan field for Ultimate users
        pipeline.push({
          $match: {
            $or: [
              // Free content is always accessible
              { access_type: "free" },
              // Subscription content: user must have matching subscription OR Ultimate subscription_plan
              {
                $and: [
                  { access_type: "subscription" },
                  {
                    $or: [
                      // Has active subscription with matching plan
                      { $expr: { $gt: [{ $size: "$userSubscription" }, 0] } },
                      // Has Ultimate subscription_plan (grants access to all subscription content)
                      {
                        $expr: {
                          $eq: [
                            { $arrayElemAt: ["$user.subscription_plan", 0] },
                            "Ultimate",
                          ],
                        },
                      },
                      // Has other paid subscription_plan - check if it matches plan_ids
                      // Note: This is a simplified check. Full matching would require Plan lookup
                      // For now, if user has a paid plan and no plan_ids restriction, allow access
                      {
                        $expr: {
                          $and: [
                            { $ne: [{ $arrayElemAt: ["$user.subscription_plan", 0] }, "Free"] },
                            { $ne: [{ $arrayElemAt: ["$user.subscription_plan", 0] }, null] },
                            { $ne: [{ $arrayElemAt: ["$user.subscription_plan", 0] }, ""] },
                            { $eq: [{ $size: "$plan_ids" }, 0] }, // If no plan_ids restriction, allow any paid plan
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              // PPV content: show all PPV content (playback restricted separately)
              // This follows "Option A: Show all content but restrict playback" approach
              { access_type: "pay_per_view" },
            ],
          },
        });
      } else {
        // If no userId and access control enabled, only show free content
        pipeline.push({
          $match: {
            access_type: "free",
          },
        });
      }
    }
    // If access control is disabled, skip filtering - show all published movies

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
    }

    pipeline.push({ $sort: { [sortField as string]: sortOrder } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    // Get total count (before skip/limit, but after access control)
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove skip and limit
      { $count: "total" },
    ];
    const countResult = await MovieModel.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Get movies
    const movies = (await MovieModel.aggregate(pipeline)) as MovieWithStats[];

    return { movies, totalItems };
  }

  async findTrending(limit = 20): Promise<Movie[]> {
    return MovieModel.find({
      deleted_at: null,
      status: "published",
      is_trending: true,
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findFeatured(limit = 20): Promise<Movie[]> {
    return MovieModel.find({
      deleted_at: null,
      status: "published",
      is_featured: true,
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findComingSoon(limit = 20): Promise<Movie[]> {
    return MovieModel.find({
      deleted_at: null,
      status: "published",
      is_coming_soon: true,
    })
      .sort({ release_date: 1 })
      .limit(limit)
      .exec();
  }

  async create(input: CreateMovieInput, userId: string): Promise<Movie> {
    // Auto-generate slug if not provided
    const slug =
      input.slug ||
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const existing = await this.findBySlug(slug);
    if (existing) {
      throw new Error("Movie with this slug already exists");
    }

    const doc = await MovieModel.create({
      ...input,
      slug,
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateMovieInput, userId?: string): Promise<Movie | null> {
    const update: any = { ...input };
    if (userId) {
      update.updated_by = new Types.ObjectId(userId);
    }

    // Check slug uniqueness if updating slug
    if (input.slug) {
      const existing = await this.findBySlug(input.slug);
      if (existing && (existing._id as any).toString() !== id) {
        throw new Error("Movie with this slug already exists");
      }
    }

    return MovieModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Movie | null> {
    // Soft delete
    return MovieModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true },
    ).exec();
  }
}

