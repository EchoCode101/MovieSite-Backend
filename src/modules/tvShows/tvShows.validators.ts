import Joi from "joi";

export const createTvShowSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  slug: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
  thumbnail_url: Joi.string().uri().optional(),
  poster_url: Joi.string().uri().optional(),
  banner_url: Joi.string().uri().optional(),
  language: Joi.string().optional(),
  imdb_rating: Joi.number().min(0).max(10).optional(),
  content_rating: Joi.string().optional(),
  release_year: Joi.number().integer().min(1900).max(2100).optional(),
  genres: Joi.array().items(Joi.string()).optional(),
  cast: Joi.array().items(Joi.string()).optional(),
  directors: Joi.array().items(Joi.string()).optional(),
  access_type: Joi.string().valid("free", "subscription", "pay_per_view").optional(),
  plan_ids: Joi.array().items(Joi.string()).optional(),
  seo_title: Joi.string().optional(),
  seo_description: Joi.string().optional(),
  seo_keywords: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid("draft", "published").optional(),
});

export const updateTvShowSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  slug: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
  thumbnail_url: Joi.string().uri().optional(),
  poster_url: Joi.string().uri().optional(),
  banner_url: Joi.string().uri().optional(),
  language: Joi.string().optional(),
  imdb_rating: Joi.number().min(0).max(10).optional(),
  content_rating: Joi.string().optional(),
  release_year: Joi.number().integer().min(1900).max(2100).optional(),
  genres: Joi.array().items(Joi.string()).optional(),
  cast: Joi.array().items(Joi.string()).optional(),
  directors: Joi.array().items(Joi.string()).optional(),
  access_type: Joi.string().valid("free", "subscription", "pay_per_view").optional(),
  plan_ids: Joi.array().items(Joi.string()).optional(),
  seo_title: Joi.string().optional(),
  seo_description: Joi.string().optional(),
  seo_keywords: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid("draft", "published").optional(),
}).min(1);

export const paginatedTvShowsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sort: Joi.string().optional().default("updatedAt"),
  order: Joi.string().valid("ASC", "DESC").optional().default("DESC"),
  genre: Joi.string().optional().allow("", null),
  year: Joi.number().integer().min(1900).max(2100).optional(),
  access_type: Joi.string().valid("free", "subscription", "pay_per_view").optional(),
  search: Joi.string().optional(),
});

