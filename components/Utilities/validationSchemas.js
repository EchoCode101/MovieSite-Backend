import Joi from "joi";
// Joi validation schema for siginup

const userSignupSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  subscription_plan: Joi.string()
    .valid("Free", "Basic", "Premium", "Ultimate")
    .default("Free"),
});

const adminSignupSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
});
// Joi validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const subscriptionSchema = Joi.object({
  subscription_plan: Joi.string()
    .valid("Free", "Basic", "Premium", "Ultimate")
    .required(),
});

export default {
  userSignupSchema,
  loginSchema,
  adminSignupSchema,
  subscriptionSchema,
};
