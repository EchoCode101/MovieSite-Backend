import {
  Videos,
  LikesDislikes,
  Members,
  VideoMetrics,
} from "../../models/index.js";
import createError from "http-errors";
import sequelize from "sequelize";

// Get all videos
export const getAllVideos = async (req, res, next) => {
  try {
    const videos = await Videos.findAll({
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json(videos);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get video by ID
export const getVideoById = async (req, res, next) => {
  try {
    const video = await Videos.findByPk(req.params.id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }
    res.status(200).json(video);
  } catch (error) {
    next(createError(500, error.message));
  }
};

export const getPaginatedVideos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt", // Default sort field
      order = "DESC", // Default sort order
    } = req.query;

    const offset = (page - 1) * limit;

    // Dynamic order logic
    const orderClause = (() => {
      if (sort === "views_count") {
        return [[{ model: VideoMetrics, as: "metrics" }, "views_count", order]];
      } else if (sort === "likes.length") {
        return [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "LikesDislikes"
              WHERE "LikesDislikes"."target_id" = "Videos"."video_id"
              AND "LikesDislikes"."target_type" = 'video'
              AND "LikesDislikes"."is_like" = true
            )`),
            order,
          ],
        ];
      } else if (sort === "dislikes.length") {
        return [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "LikesDislikes"
              WHERE "LikesDislikes"."target_id" = "Videos"."video_id"
              AND "LikesDislikes"."target_type" = 'video'
              AND "LikesDislikes"."is_like" = false
            )`),
            order,
          ],
        ];
      } else if (sort === "rating") {
        return [
          [
            sequelize.literal(`(
              SELECT AVG("rating")
              FROM "ReviewsAndRatings"
              WHERE "ReviewsAndRatings"."video_id" = "Videos"."video_id"
            )`),
            order,
          ],
        ];
      }
      return [[sort, order]]; // Default sorting
    })();

    // Fetch paginated data
    const { count, rows: videos } = await Videos.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: orderClause,
      include: [
        {
          model: VideoMetrics,
          as: "metrics",
          attributes: ["views_count", "shares_count", "favorites_count"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`ROUND((
        SELECT AVG("rating")
        FROM "ReviewsAndRatings"
        WHERE "ReviewsAndRatings"."video_id" = "Videos"."video_id"
      ), 1)`),
            "average_rating",
          ],
        ],
      },
    });

    res.status(200).json({
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      videos,
    });
  } catch (error) {
    console.error("Error fetching paginated videos:", error);
    next(createError(500, error.message || "Error fetching videos"));
  }
};

// Get videos with likes/dislikes and their associated member information
export const getVideosWithLikesDislikes = async (req, res, next) => {
  try {
    const videos = await Videos.findAll({
      attributes: [
        "video_id",
        "title",
        "description",
        "video_url",
        "duration",
        "resolution",
        "file_size",
        "video_url_encrypted",
        "access_level",
        "category",
        "language",
        "thumbnail_url",
        "age_restriction",
        "published",
        "video_format",
        "license_type",
        "seo_title",
        "seo_description",
        "custom_metadata",
        "createdAt",
        "updatedAt",
        [
          LikesDislikes.sequelize.literal(`
            (SELECT COUNT(*) FROM "LikesDislikes" 
             WHERE "LikesDislikes"."target_id" = "Videos"."video_id" 
             AND "LikesDislikes"."target_type" = 'video' 
             AND "LikesDislikes"."is_like" = true)
          `),
          "likes",
        ],
        [
          LikesDislikes.sequelize.literal(`
            (SELECT COUNT(*) FROM "LikesDislikes" 
             WHERE "LikesDislikes"."target_id" = "Videos"."video_id" 
             AND "LikesDislikes"."target_type" = 'video' 
             AND "LikesDislikes"."is_like" = false)
          `),
          "dislikes",
        ],
      ],
      include: [
        {
          model: LikesDislikes,
          as: "likesDislikes",
          attributes: ["is_like"],
          include: [
            {
              model: Members,
              as: "user",
              attributes: ["member_id", "first_name", "last_name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos with likes/dislikes:", error);
    next(createError(500, error.message));
  }
};
// Create a new video
export const createVideo = async (req, res, next) => {
  try {
    const video = await Videos.create(req.body);
    res.status(201).json(video);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Update an existing video
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Videos.findByPk(req.params.id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }

    const updatedVideo = await video.update(req.body);
    res.status(200).json(updatedVideo);
  } catch (error) {
    if (error.message.includes("unique constraint")) {
      next(createError(400, "Title or Video URL already exists"));
    } else {
      next(createError(500, error.message));
    }
  }
};

// Delete a video
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Videos.findByPk(req.params.id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }

    await video.destroy();
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    next(createError(500, error.message));
  }
};
