import { VideoMetrics, Videos } from "../../models/index.js";
import createError from "http-errors";

// Fetch all video metrics with associated video data
export const getVideoMetrics = async (req, res, next) => {
  try {
    const videoMetrics = await VideoMetrics.find()
      .populate({
        path: "video_id",
        select: "title category access_level file_size",
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Video metrics retrieved successfully",
      data: videoMetrics,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};
