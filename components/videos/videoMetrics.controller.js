import { VideoMetrics, Videos } from "../../models/index.js";
import createError from "http-errors";

// Fetch all video metrics with associated video data
export const getVideoMetrics = async (req, res, next) => {
  try {
    const videoMetrics = await VideoMetrics.findAll({
      include: [
        {
          model: Videos,
          as: "video", // Ensure this matches the association alias
          attributes: [
            "video_id",
            "title",
            "category",
            "access_level",
            "file_size",
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json(videoMetrics);
  } catch (error) {
    next(createError(500, error.message));
  }
};
