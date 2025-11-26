import { createCommentSchema, updateCommentSchema } from "../../utils/validationSchemas.js";
import Joi from "joi";

/**
 * Schema for paginated comments query parameters
 */
export const paginatedCommentsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sort: Joi.string()
    .valid("createdAt", "updatedAt", "likes", "dislikes", "_id", "comment_id")
    .optional()
    .default("createdAt"),
  order: Joi.string().valid("ASC", "DESC").optional().default("DESC"),
});

/**
 * Schema for bulk delete
 */
export const bulkDeleteCommentsSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).required(),
});

// Re-export create and update schemas
export { createCommentSchema, updateCommentSchema };

