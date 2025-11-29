import Joi from "joi";

export const purchasePayPerViewSchema = Joi.object({
  target_type: Joi.string().valid("movie", "episode").required(),
  target_id: Joi.string().required(),
  purchase_type: Joi.string().valid("rent", "buy").optional(),
});

export const checkAccessSchema = Joi.object({
  targetType: Joi.string().valid("movie", "episode").required(),
  targetId: Joi.string().required(),
});

