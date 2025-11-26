import { VideoMetricsRepository } from "./videoMetrics.repository.js";
import type { VideoMetricWithVideo } from "./videoMetrics.types.js";

export class VideoMetricsService {
    private repository: VideoMetricsRepository;

    constructor(repository = new VideoMetricsRepository()) {
        this.repository = repository;
    }

    /**
     * Get all video metrics with associated video data
     */
    async getVideoMetrics(): Promise<VideoMetricWithVideo[]> {
        return await this.repository.findAllWithVideo();
    }
}

