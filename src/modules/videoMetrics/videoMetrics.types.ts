import type { VideoMetric } from "../../models/videoMetric.model.js";

/**
 * Video metric with populated video data
 */
export interface VideoMetricWithVideo extends Omit<VideoMetric, "video_id"> {
    video_id: {
        _id: string;
        title: string;
        category?: string;
        access_level?: string;
        file_size?: number;
    };
}

