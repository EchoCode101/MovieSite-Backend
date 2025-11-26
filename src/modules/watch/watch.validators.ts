import Joi from "joi";

export const watchValidators = {
  addToWatchlistSchema: Joi.object({
    profile_id: Joi.string().required(),
    target_type: Joi.string().valid("movie", "tvshow", "episode").required(),
    target_id: Joi.string().required(),
  }),

  updateWatchProgressSchema: Joi.object({
    profile_id: Joi.string().required(),
    target_type: Joi.string().valid("movie", "episode").required(),
    target_id: Joi.string().required(),
    watched_seconds: Joi.number().min(0).required(),
    total_seconds: Joi.number().min(0).required(),
  }),

  getWatchlistQuerySchema: Joi.object({
    profile_id: Joi.string().optional(),
    target_type: Joi.string().valid("movie", "tvshow", "episode").optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  getContinueWatchingQuerySchema: Joi.object({
    profile_id: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(50).optional(),
  }),
};

