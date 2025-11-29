import Joi from "joi";

export const createGenreSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  slug: Joi.string().min(1).max(255).optional(),
});

export const updateGenreSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  slug: Joi.string().min(1).max(255).optional(),
}).min(1);

