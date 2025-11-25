import { Videos, Members } from "../../models/index.js";
import createError from "http-errors";
import logger from "../Utilities/logger.js";

export const search = async (req, res, next) => {
  const { q, type = "all", page = 1, limit = 10 } = req.query;

  if (!q) {
    return next(createError(400, "Search query 'q' is required"));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const regex = new RegExp(q, "i"); // Case-insensitive search

  try {
    let results = {};
    let totalResults = 0;

    // Search Videos
    if (type === "all" || type === "video") {
      const videoQuery = {
        $or: [{ title: regex }, { description: regex }, { tags: regex }],
      };

      const videos = await Videos.find(videoQuery)
        .select("title description thumbnail_url video_url views_count createdAt")
        .skip(type === "video" ? skip : 0)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const videoCount = await Videos.countDocuments(videoQuery);

      if (type === "video") {
        totalResults = videoCount;
        results = videos;
      } else {
        results.videos = videos;
        results.videoCount = videoCount;
      }
    }

    // Search Users
    if (type === "all" || type === "user") {
      const userQuery = {
        $or: [
          { username: regex },
          { first_name: regex },
          { last_name: regex },
          { email: regex },
        ],
      };

      const users = await Members.find(userQuery)
        .select("username first_name last_name profile_pic")
        .skip(type === "user" ? skip : 0)
        .limit(parseInt(limit));

      const userCount = await Members.countDocuments(userQuery);

      if (type === "user") {
        totalResults = userCount;
        results = users;
      } else {
        results.users = users;
        results.userCount = userCount;
      }
    }

    res.status(200).json({
      success: true,
      message: "Search results retrieved successfully",
      data: {
        query: q,
        type,
        page: parseInt(page),
        limit: parseInt(limit),
        totalResults: type !== "all" ? totalResults : undefined,
        results,
      },
    });
  } catch (error) {
    logger.error("Error performing search:", error);
    next(createError(500, error.message));
  }
};
