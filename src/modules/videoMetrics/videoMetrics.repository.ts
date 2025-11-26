import { VideoMetricModel, type VideoMetric } from "../../models/videoMetric.model.js";
import type { VideoMetricWithVideo } from "./videoMetrics.types.js";

export class VideoMetricsRepository {
    /**
     * Find all video metrics with populated video data
     */
    async findAllWithVideo(): Promise<VideoMetricWithVideo[]> {
        return (await VideoMetricModel.find()
            .populate({
                path: "video_id",
                select: "title category access_level file_size",
            })
            .sort({ updatedAt: -1 })
            .exec()) as unknown as VideoMetricWithVideo[];
    }

    /**
     * Find video metric by video ID
     */
    async findByVideoId(videoId: string): Promise<VideoMetric | null> {
        return await VideoMetricModel.findOne({ video_id: videoId }).exec();
    }
}

