import Joi from "joi";

export const createSettingSchema = Joi.object({
  key: Joi.string().min(1).max(255).required(),
  value: Joi.any().required(),
  group: Joi.string()
    .valid("app", "payment", "auth", "firebase", "ads", "tmdb", "mail", "seo")
    .required(),
});

export const updateSettingSchema = Joi.object({
  value: Joi.any().optional(),
  group: Joi.string()
    .valid("app", "payment", "auth", "firebase", "ads", "tmdb", "mail", "seo")
    .optional(),
}).min(1);

