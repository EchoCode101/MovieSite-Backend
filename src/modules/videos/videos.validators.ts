import { createVideoSchema } from "../../utils/validationSchemas.js";
import Joi from "joi";

/**
 * Schema for paginated videos query parameters
 */
export const paginatedVideosSchema = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    sort: Joi.string()
        .valid("updatedAt", "createdAt", "views_count", "likes.length", "dislikes.length", "rating", "title", "_id", "video_id")
        .optional()
        .default("updatedAt"),
    order: Joi.string().valid("ASC", "DESC").optional().default("DESC"),
});

/**
 * Schema for updating a video
 */
export const updateVideoSchema = Joi.object({
    title: Joi.string().max(255).optional(),
    description: Joi.string().optional(),
    video_url: Joi.string().uri().optional(),
    thumbnail_url: Joi.string().uri().optional(),
    duration: Joi.number().optional(),
    resolution: Joi.string().max(20).optional(),
    file_size: Joi.number().optional(),
    category: Joi.string().max(100).optional(),
    language: Joi.string().max(50).optional(),
    age_restriction: Joi.boolean().optional(),
    published: Joi.boolean().optional(),
    seo_title: Joi.string().max(255).optional(),
    seo_description: Joi.string().optional(),
    license_type: Joi.string().max(100).optional(),
    access_level: Joi.string().max(50).optional(),
    video_format: Joi.string().max(50).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    gallery: Joi.array().items(Joi.string()).optional(),
}).min(1); // At least one field required

/**
 * Schema for bulk delete
 */
export const bulkDeleteVideosSchema = Joi.object({
    ids: Joi.array().items(Joi.string().required()).min(1).required(),
});

// Re-export createVideoSchema for convenience
export { createVideoSchema };

