import Joi from "joi";

export const createSeasonSchema = Joi.object({
  tv_show_id: Joi.string().required(),
  season_number: Joi.number().integer().min(1).required(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  poster_url: Joi.string().uri().optional(),
  release_date: Joi.date().optional(),
  seo_title: Joi.string().optional(),
  seo_description: Joi.string().optional(),
  status: Joi.string().valid("draft", "published").optional(),
});

export const updateSeasonSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  poster_url: Joi.string().uri().optional(),
  release_date: Joi.date().optional(),
  seo_title: Joi.string().optional(),
  seo_description: Joi.string().optional(),
  status: Joi.string().valid("draft", "published").optional(),
}).min(1);

