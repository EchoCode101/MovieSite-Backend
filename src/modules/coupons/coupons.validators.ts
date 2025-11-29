import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().min(1).max(50).required(),
  description: Joi.string().optional(),
  discount_type: Joi.string().valid("fixed", "percent").required(),
  discount_value: Joi.number().min(0).required(),
  max_uses: Joi.number().integer().min(1).optional(),
  max_uses_per_user: Joi.number().integer().min(1).optional(),
  valid_from: Joi.date().optional(),
  valid_until: Joi.date().optional(),
  applicable_plan_ids: Joi.array().items(Joi.string()).optional(),
  is_active: Joi.boolean().optional(),
});

export const updateCouponSchema = Joi.object({
  description: Joi.string().optional(),
  discount_type: Joi.string().valid("fixed", "percent").optional(),
  discount_value: Joi.number().min(0).optional(),
  max_uses: Joi.number().integer().min(1).optional(),
  max_uses_per_user: Joi.number().integer().min(1).optional(),
  valid_from: Joi.date().optional(),
  valid_until: Joi.date().optional(),
  applicable_plan_ids: Joi.array().items(Joi.string()).optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

export const validateCouponSchema = Joi.object({
  code: Joi.string().required(),
  plan_id: Joi.string().optional(),
});

