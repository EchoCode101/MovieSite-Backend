import Joi from "joi";

export const createTaxSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  country: Joi.string().optional(),
  rate_percent: Joi.number().min(0).max(100).required(),
  is_active: Joi.boolean().optional(),
});

export const updateTaxSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  country: Joi.string().optional(),
  rate_percent: Joi.number().min(0).max(100).optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

