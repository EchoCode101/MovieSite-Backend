import Joi from "joi";
// Joi validation schema for siginup

const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  subscription_plan: Joi.string()
    .valid("Free", "Basic", "Premium", "Ultimate")
    .default("Free"),
});
// Joi validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export default { userSchema, loginSchema };
