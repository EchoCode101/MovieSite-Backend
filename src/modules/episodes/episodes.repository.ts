import { Types } from "mongoose";
import type { PipelineStage } from "mongoose";
import { EpisodeModel, type Episode } from "../../models/episode.model.js";
import type { CreateEpisodeInput, UpdateEpisodeInput, PaginatedEpisodesParams, EpisodeWithStats } from "./episodes.types.js";
import { SubscriptionModel } from "../../models/subscription.model.js";
import { PayPerViewModel } from "../../models/payPerView.model.js";
import config from "../../config/env.js";

export class EpisodesRepository {
  async findAll(): Promise<Episode[]> {
    return EpisodeModel.find({ deleted_at: null })
      .sort({ episode_number: 1 })
      .exec();
  }

  async findById(id: string): Promise<Episode | null> {
    return EpisodeModel.findOne({ _id: id, deleted_at: null }).exec();
  }

  async findBySeasonId(seasonId: string): Promise<Episode[]> {
    return EpisodeModel.find({
      season_id: seasonId,
      deleted_at: null,
      status: "published",
    })
      .sort({ episode_number: 1 })
      .exec();
  }

  async findPaginated(
    params: PaginatedEpisodesParams,
    userId?: string,
  ): Promise<{ episodes: EpisodeWithStats[]; totalItems: number }> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "DESC",
      genre,
      year,
      access_type,
      search,
      tv_show_id,
      season_id,
    } = params;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build match stage
    const matchStage: any = { deleted_at: null, status: "published" };

    if (tv_show_id) {
      matchStage.tv_show_id = new Types.ObjectId(tv_show_id);
    }

    if (season_id) {
      matchStage.season_id = new Types.ObjectId(season_id);
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
          from: "tvshows",
          localField: "tv_show_id",
          foreignField: "_id",
          as: "tv_show",
        },
      },
      {
        $unwind: {
          path: "$tv_show",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "likesdislikes",
          let: { episodeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$episodeId"] },
                    { $eq: ["$target_type", "episode"] },
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
          let: { episodeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$episodeId"] },
                    { $eq: ["$target_type", "episode"] },
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
          from: "reviews",
          let: { episodeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$episodeId"] },
                    { $eq: ["$target_type", "episode"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "ratingData",
        },
      },
      {
        $addFields: {
          likes_count: { $size: "$likes" },
          dislikes_count: { $size: "$dislikes" },
          average_rating: {
            $ifNull: [{ $arrayElemAt: ["$ratingData.avgRating", 0] }, null],
          },
        },
      },
    ];

    // Filter by genre through TV show
    if (genre && genre !== "All" && genre.trim() !== "") {
      pipeline.push({
        $match: {
          "tv_show.genres": new Types.ObjectId(genre),
        },
      });
    }

    // Add access control filtering only if access control is enabled
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

        // Get user's active subscription (for plan ID matching)
        const activeSubscription = await SubscriptionModel.findOne({
          user_id: userIdObj,
          status: "active",
          ends_at: { $gte: new Date() },
        }).populate("plan_id");

        const userPlanIds = activeSubscription?.plan_id
          ? [(activeSubscription.plan_id as any)._id.toString()]
          : [];

        // Get user's PPV purchases
        const ppvPurchases = await PayPerViewModel.find({
          user_id: userIdObj,
          expires_at: { $gte: new Date() },
        }).distinct("target_id");

        // Build access control match conditions
        const accessControlConditions: any[] = [
          { access_type: "free" },
        ];

        // Subscription content access conditions
        const subscriptionConditions: any[] = [];

        // If user has active subscription with matching plan
        if (userPlanIds.length > 0) {
          subscriptionConditions.push({
            $or: [
              { plan_ids: { $size: 0 } },
              { plan_ids: { $in: userPlanIds.map((id) => new Types.ObjectId(id)) } },
            ],
          });
        }

        // Ultimate subscription_plan grants access to all subscription content
        // Use $expr to enable expression-based matching
        subscriptionConditions.push({
          $expr: {
            $eq: [
              { $arrayElemAt: ["$user.subscription_plan", 0] },
              "Ultimate",
            ],
          },
        });

        // Other paid subscription_plan - if no plan_ids restriction, allow access
        subscriptionConditions.push({
          $expr: {
            $and: [
              { $ne: [{ $arrayElemAt: ["$user.subscription_plan", 0] }, "Free"] },
              { $ne: [{ $arrayElemAt: ["$user.subscription_plan", 0] }, null] },
              { $ne: [{ $arrayElemAt: ["$user.subscription_plan", 0] }, ""] },
              { $eq: [{ $size: "$plan_ids" }, 0] }, // If no plan_ids restriction, allow any paid plan
            ],
          },
        });

        if (subscriptionConditions.length > 0) {
          accessControlConditions.push({
            $and: [
              { access_type: "subscription" },
              { $or: subscriptionConditions },
            ],
          });
        }

        // PPV content: show all PPV content (playback restricted separately)
        // This follows "Option A: Show all content but restrict playback" approach
        // Users can see PPV episodes in catalog, but playback requires purchase
        accessControlConditions.push({
          access_type: "pay_per_view",
        });

        pipeline.push({
          $match: {
            $or: accessControlConditions,
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
    // If access control is disabled, skip filtering - show all published episodes

    // Add sorting
    let sortField = sort;
    if (sort === "views_count") {
      sortField = "views_count";
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
    const countResult = await EpisodeModel.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Get episodes
    const episodes = (await EpisodeModel.aggregate(pipeline)) as EpisodeWithStats[];

    return { episodes, totalItems };
  }

  async create(input: CreateEpisodeInput, userId: string): Promise<Episode> {
    const doc = await EpisodeModel.create({
      ...input,
      tv_show_id: new Types.ObjectId(input.tv_show_id),
      season_id: new Types.ObjectId(input.season_id),
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateEpisodeInput, userId?: string): Promise<Episode | null> {
    const update: any = { ...input };
    if (userId) {
      update.updated_by = new Types.ObjectId(userId);
    }

    return EpisodeModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Episode | null> {
    return EpisodeModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true },
    ).exec();
  }
}

