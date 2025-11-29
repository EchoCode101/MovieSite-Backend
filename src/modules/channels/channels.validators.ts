import Joi from "joi";

export const createChannelSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  slug: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
  logo_url: Joi.string().uri().optional(),
  banner_url: Joi.string().uri().optional(),
  stream_url: Joi.string().uri().optional(),
  stream_type: Joi.string().valid("hls", "dash", "mp4").optional(),
  language: Joi.string().optional(),
  country: Joi.string().optional(),
  category: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
  is_featured: Joi.boolean().optional(),
  sort_order: Joi.number().integer().optional(),
});

export const updateChannelSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  slug: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
  logo_url: Joi.string().uri().optional(),
  banner_url: Joi.string().uri().optional(),
  stream_url: Joi.string().uri().optional(),
  stream_type: Joi.string().valid("hls", "dash", "mp4").optional(),
  language: Joi.string().optional(),
  country: Joi.string().optional(),
  category: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
  is_featured: Joi.boolean().optional(),
  sort_order: Joi.number().integer().optional(),
}).min(1);

