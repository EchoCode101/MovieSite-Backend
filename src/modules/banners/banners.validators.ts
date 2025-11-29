import Joi from "joi";

export const createBannerSchema = Joi.object({
  title: Joi.string().optional(),
  device: Joi.string().valid("web", "mobile", "tv").optional(),
  position: Joi.string().valid("home", "movie", "tv", "video").optional(),
  target_type: Joi.string().valid("movie", "tvshow", "episode").required(),
  target_id: Joi.string().required(),
  image_url: Joi.string().uri().required(),
  sort_order: Joi.number().integer().optional(),
  is_active: Joi.boolean().optional(),
});

export const updateBannerSchema = Joi.object({
  title: Joi.string().optional(),
  device: Joi.string().valid("web", "mobile", "tv").optional(),
  position: Joi.string().valid("home", "movie", "tv", "video").optional(),
  target_type: Joi.string().valid("movie", "tvshow", "episode").optional(),
  target_id: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
  sort_order: Joi.number().integer().optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

export const listBannersQuerySchema = Joi.object({
  device: Joi.string().valid("web", "mobile", "tv").optional(),
  position: Joi.string().valid("home", "movie", "tv", "video").optional(),
});

