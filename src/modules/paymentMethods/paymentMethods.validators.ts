import Joi from "joi";

export const createPaymentMethodSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  display_name: Joi.string().optional(),
  config: Joi.object().required(),
  is_active: Joi.boolean().optional(),
  is_default: Joi.boolean().optional(),
});

export const updatePaymentMethodSchema = Joi.object({
  display_name: Joi.string().optional(),
  config: Joi.object().optional(),
  is_active: Joi.boolean().optional(),
  is_default: Joi.boolean().optional(),
}).min(1);

