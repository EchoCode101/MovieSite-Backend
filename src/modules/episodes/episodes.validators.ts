import Joi from "joi";

export const createEpisodeSchema = Joi.object({
  tv_show_id: Joi.string().required(),
  season_id: Joi.string().required(),
  episode_number: Joi.number().integer().min(1).required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().optional(),
  thumbnail_url: Joi.string().uri().optional(),
  streams: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().optional(),
        type: Joi.string().optional(),
        url: Joi.string().uri().required(),
      }),
    )
    .optional(),
  enable_subtitle: Joi.boolean().optional(),
  subtitles: Joi.array()
    .items(
      Joi.object({
        language: Joi.string().required(),
        is_default: Joi.boolean().optional(),
        url: Joi.string().uri().required(),
      }),
    )
    .optional(),
  duration_minutes: Joi.number().min(0).optional(),
  release_date: Joi.date().optional(),
  access_type: Joi.string().valid("free", "subscription", "pay_per_view").optional(),
  plan_ids: Joi.array().items(Joi.string()).optional(),
  pay_per_view_price: Joi.number().min(0).optional(),
  seo_title: Joi.string().optional(),
  seo_description: Joi.string().optional(),
  status: Joi.string().valid("draft", "published").optional(),
});

export const updateEpisodeSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
  thumbnail_url: Joi.string().uri().optional(),
  streams: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().optional(),
        type: Joi.string().optional(),
        url: Joi.string().uri().required(),
      }),
    )
    .optional(),
  enable_subtitle: Joi.boolean().optional(),
  subtitles: Joi.array()
    .items(
      Joi.object({
        language: Joi.string().required(),
        is_default: Joi.boolean().optional(),
        url: Joi.string().uri().required(),
      }),
    )
    .optional(),
  duration_minutes: Joi.number().min(0).optional(),
  release_date: Joi.date().optional(),
  access_type: Joi.string().valid("free", "subscription", "pay_per_view").optional(),
  plan_ids: Joi.array().items(Joi.string()).optional(),
  pay_per_view_price: Joi.number().min(0).optional(),
  seo_title: Joi.string().optional(),
  seo_description: Joi.string().optional(),
  status: Joi.string().valid("draft", "published").optional(),
}).min(1);

export const paginatedEpisodesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sort: Joi.string().optional().default("updatedAt"),
  order: Joi.string().valid("ASC", "DESC").optional().default("DESC"),
  genre: Joi.string().optional().allow("", null),
  year: Joi.number().integer().min(1900).max(2100).optional(),
  access_type: Joi.string().valid("free", "subscription", "pay_per_view").optional(),
  search: Joi.string().optional(),
  tv_show_id: Joi.string().optional(),
  season_id: Joi.string().optional(),
});

