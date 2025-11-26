import { Types } from "mongoose";
import createError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { VideosRepository } from "./videos.repository.js";
import type {
    CreateVideoInput,
    UpdateVideoInput,
    PaginatedVideosParams,
    PaginatedVideosResponse,
    VideoWithStats,
    VideoWithLikesDislikes,
    VideoUploadResult,
    BulkDeleteVideosInput,
} from "./videos.types.js";
import type { Video } from "../../models/video.model.js";

export class VideosService {
    private repository: VideosRepository;

    constructor(repository = new VideosRepository()) {
        this.repository = repository;
    }

    /**
     * Get all videos (admin only)
     */
    async getAllVideos(): Promise<Video[]> {
        return await this.repository.findAll();
    }

    /**
     * Get video by ID
     */
    async getVideoById(id: string): Promise<Video> {
        const video = await this.repository.findById(id);
        if (!video) {
            throw createError(404, "Video not found");
        }
        return video;
    }

    /**
     * Get paginated videos with sorting
     */
    async getPaginatedVideos(
        params: PaginatedVideosParams
    ): Promise<PaginatedVideosResponse> {
        const { page = 1, limit = 10 } = params;
        const { videos, totalItems } = await this.repository.findPaginated(params);

        return {
            currentPage: Number(page),
            totalPages: Math.ceil(totalItems / Number(limit)),
            totalItems,
            videos,
        };
    }

    /**
     * Get videos with likes/dislikes (admin analytics)
     */
    async getVideosWithLikesDislikes(): Promise<VideoWithLikesDislikes[]> {
        return await this.repository.findWithLikesDislikes();
    }

    /**
     * Create a new video (admin only)
     */
    async createVideo(
        data: CreateVideoInput,
        userId: string
    ): Promise<Video> {
        if (!data.video_url) {
            throw createError(400, "Video URL is required.");
        }

        return await this.repository.create({
            ...data,
            created_by: new Types.ObjectId(userId),
        });
    }

    /**
     * Update video (admin only)
     */
    async updateVideo(
        id: string,
        data: UpdateVideoInput
    ): Promise<Video> {
        const video = await this.repository.updateById(id, data);
        if (!video) {
            throw createError(404, "Video not found");
        }
        return video;
    }

    /**
     * Delete video (admin only)
     */
    async deleteVideo(id: string): Promise<void> {
        const video = await this.repository.deleteById(id);
        if (!video) {
            throw createError(404, "Video not found");
        }
    }

    /**
     * Bulk delete videos (admin or owner)
     */
    async bulkDeleteVideos(
        input: BulkDeleteVideosInput,
        userId: string,
        isAdmin: boolean
    ): Promise<{ deletedCount: number }> {
        return await this.repository.bulkDelete(input.ids, userId, isAdmin);
    }

    /**
     * Upload video to Cloudinary
     */
    async uploadVideoToCloudinary(
        file: Express.Multer.File
    ): Promise<VideoUploadResult> {
        if (!file) {
            throw createError(400, "No video file uploaded.");
        }

        return new Promise<VideoUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "videos",
                    resource_type: "video",
                    public_id: `video_${Date.now()}`,
                },
                (error: Error | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(createError(500, "Cloudinary upload failed."));
                        return;
                    }
                    if (!result) {
                        reject(createError(500, "Cloudinary upload failed: no result."));
                        return;
                    }

                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height,
                        duration: result.duration,
                        format: result.format,
                        bytes: result.bytes,
                    });
                }
            );
            uploadStream.end(file.buffer);
        });
    }

    /**
     * Add video to database (authenticated)
     */
    async addVideoToDatabase(
        data: CreateVideoInput,
        userId: string
    ): Promise<Video> {
        if (!data.title || !data.video_url) {
            throw createError(400, "Title and video URL are required.");
        }

        // Sanitize data
        const sanitizedData: CreateVideoInput & { created_by: Types.ObjectId } = {
            title: data.title,
            description: data.description || undefined,
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url || undefined,
            duration: data.duration || undefined,
            resolution: data.resolution || undefined,
            file_size: data.file_size || undefined,
            video_format: data.video_format || undefined,
            license_type: data.license_type || undefined,
            access_level: data.access_level || "Free",
            category: data.category || undefined,
            language: data.language || undefined,
            tags: data.tags,
            gallery: data.gallery,
            created_by: new Types.ObjectId(userId),
        };

        return await this.repository.create(sanitizedData);
    }
}

