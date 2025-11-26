import Joi from "joi";

export const subscriptionsValidators = {
  createSubscriptionSchema: Joi.object({
    plan_id: Joi.string().required(),
    coupon_code: Joi.string().optional(),
  }),

  cancelSubscriptionSchema: Joi.object({
    subscription_id: Joi.string().required(),
  }),

  getPlansQuerySchema: Joi.object({
    is_active: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional(),
    billing_cycle: Joi.string().valid("weekly", "monthly", "quarterly", "yearly").optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

