import Joi from "joi";

export const createProfileSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  avatar_url: Joi.string().uri().optional(),
  is_kid: Joi.boolean().optional(),
  language: Joi.string().min(2).max(10).optional(),
  pin: Joi.string().min(4).max(10).optional(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  avatar_url: Joi.string().uri().optional(),
  is_kid: Joi.boolean().optional(),
  language: Joi.string().min(2).max(10).optional(),
  pin: Joi.string().min(4).max(10).optional(),
  autoplay_next: Joi.boolean().optional(),
  autoplay_trailers: Joi.boolean().optional(),
}).min(1);


