import Joi from "joi";

/**
 * Schema for search query parameters
 */
export const searchQuerySchema = Joi.object({
    q: Joi.string().required().min(1),
    type: Joi.string().valid("all", "video", "user").optional().default("all"),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
});

