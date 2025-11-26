import Joi from "joi";

/**
 * Schema for paginated notifications query parameters
 */
export const paginatedNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

/**
 * Schema for bulk delete
 */
export const bulkDeleteNotificationsSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).required(),
});

