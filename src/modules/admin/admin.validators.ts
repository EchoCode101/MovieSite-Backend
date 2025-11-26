import { adminSignupSchema, loginSchema } from "../../utils/validationSchemas.js";
import Joi from "joi";

/**
 * Schema for updating subscription
 */
export const updateSubscriptionSchema = Joi.object({
    userId: Joi.string().required(),
    newPlan: Joi.string()
        .valid("Free", "Basic", "Premium", "Ultimate")
        .required(),
});

/**
 * Schema for reset password
 */
export const resetPasswordSchema = Joi.object({
    password: Joi.string().min(6).required(),
});

// Re-export admin signup and login schemas
export { adminSignupSchema, loginSchema };

