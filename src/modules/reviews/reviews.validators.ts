import { createReviewSchema, updateReviewSchema } from "../../utils/validationSchemas.js";
import Joi from "joi";

/**
 * Schema for paginated reviews query parameters
 */
export const paginatedReviewsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sort: Joi.string()
    .valid("createdAt", "updatedAt", "rating", "likes", "dislikes", "_id", "review_id")
    .optional()
    .default("createdAt"),
  order: Joi.string().valid("ASC", "DESC").optional().default("DESC"),
});

/**
 * Schema for recent reviews query parameters
 */
export const recentReviewsSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
}).custom((value, helpers) => {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    return helpers.message({ custom: "startDate must be before endDate" });
  }
  return value;
});

/**
 * Schema for bulk delete reviews
 */
export const bulkDeleteReviewsSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).required(),
});

// Re-export create and update schemas
export { createReviewSchema, updateReviewSchema };

