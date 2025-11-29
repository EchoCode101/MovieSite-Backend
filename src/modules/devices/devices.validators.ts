import Joi from "joi";

export const createDeviceSchema = Joi.object({
  device_id: Joi.string().required(),
  device_type: Joi.string().valid("web", "android", "ios", "tv").optional(),
  device_name: Joi.string().optional(),
});

export const updateDeviceSchema = Joi.object({
  device_name: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

