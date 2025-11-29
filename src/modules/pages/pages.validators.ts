import Joi from "joi";

export const createPageSchema = Joi.object({
  slug: Joi.string().min(1).max(255).required(),
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().required(),
  is_active: Joi.boolean().optional(),
});

export const updatePageSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  content: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

