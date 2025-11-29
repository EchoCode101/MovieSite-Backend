import Joi from "joi";

export const createCastCrewSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  type: Joi.string().valid("actor", "director", "writer", "crew").required(),
  bio: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
});

export const updateCastCrewSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  type: Joi.string().valid("actor", "director", "writer", "crew").optional(),
  bio: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
}).min(1);

export const listCastCrewQuerySchema = Joi.object({
  type: Joi.string().valid("actor", "director", "writer", "crew").optional(),
  search: Joi.string().optional(),
});

