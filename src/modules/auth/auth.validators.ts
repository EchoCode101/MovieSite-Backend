import validationSchemas from "../../utils/validationSchemas.js";
import type Joi from "joi";

const { userSignupSchema, loginSchema } = validationSchemas as {
  userSignupSchema: Joi.ObjectSchema;
  loginSchema: Joi.ObjectSchema;
};

export const authValidators = {
  userSignupSchema,
  loginSchema,
};


