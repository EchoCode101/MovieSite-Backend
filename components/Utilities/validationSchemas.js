import Joi from "joi";
import passwordSchema from "./passwordValidator.js";

// Custom Password Validation with Feedback
const passwordValidation = (value, helpers) => {
  const validationResults = passwordSchema.validate(value, { list: true });

  // If password fails validation
  if (validationResults.length > 0) {
    // Generate a custom error message
    const messages = {
      min: "Password must be at least 8 characters long.",
      max: "Password must be no more than 100 characters.",
      uppercase: "Password must contain at least one uppercase letter.",
      lowercase: "Password must contain at least one lowercase letter.",
      digits: "Password must contain at least one digit.",
      spaces: "Password must not contain spaces.",
      oneOf: "Password is too common. Please choose a more secure password.",
    };

    // Map validation results to messages
    const message = validationResults
      .map((key) => messages[key] || "Password validation failed.")
      .join(" ");

    // Properly return a Joi validation error
    return helpers.message(message);
  }

  // If password is valid, return it
  return value;
};

const userSignupSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().required(),
  password: Joi.string()
    .custom(passwordValidation, "Password Validation")
    .required(),
  // password: Joi.string().min(6).required(),
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
// Validation schema for creating a member
const createMemberSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .custom(passwordValidation, "Password Validation")
    .required(),
  subscription_plan: Joi.string()
    .valid("Free", "Basic", "Premium", "Ultimate")
    .default("Free"),
  role: Joi.string().valid("user", "admin").default("user"),
  profile_pic: Joi.string().uri().allow("").optional(),
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
  status: Joi.string().valid("Active", "Inactive").default("Active"),
});

export default {
  userSignupSchema,
  loginSchema,
  adminSignupSchema,
  subscriptionSchema,
  createMemberSchema,
};
