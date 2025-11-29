import Joi from "joi";
import PasswordValidator from "password-validator";

// Password validator schema
const passwordSchema = new PasswordValidator();

// Define password rules
passwordSchema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have at least one digit
    .has()
    .not()
    .spaces() // Should not have spaces
    .is()
    .not()
    .oneOf(["Password123", "12345678"]); // Blacklist common passwords

// Custom Password Validation with Feedback
const passwordValidation = (value: string, helpers: Joi.CustomHelpers<string>): string | Joi.ErrorReport => {
    const validationResults = passwordSchema.validate(value, { list: true }) as string[];

    // If password fails validation
    if (validationResults.length > 0) {
        // Generate a custom error message
        const messages: Record<string, string> = {
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
        return helpers.error("any.invalid", { message });
    }

    // If password is valid, return it
    return value;
};

// User signup schema
export const userSignupSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().custom(passwordValidation, "Password Validation").required(),
    email: Joi.string().email().required(),
    subscription_plan: Joi.string()
        .valid("Free", "Basic", "Premium", "Ultimate")
        .default("Free"),
});

// Admin signup schema
export const adminSignupSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
});

// Login schema
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// Subscription schema
export const subscriptionSchema = Joi.object({
    subscription_plan: Joi.string()
        .valid("Free", "Basic", "Premium", "Ultimate")
        .required(),
});

// Create member schema
export const createMemberSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    email: Joi.string().email().required(),
    password: Joi.string().custom(passwordValidation, "Password Validation").required(),
    subscription_plan: Joi.string()
        .valid("Free", "Basic", "Premium", "Ultimate")
        .default("Free"),
    role: Joi.string().valid("user", "admin").default("user"),
    profile_pic: Joi.string().uri().allow("").optional(),
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active"),
});

// Create video schema
export const createVideoSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    video_url: Joi.string().uri().optional(),
    duration: Joi.number().optional(),
    resolution: Joi.string().default("FullHD"),
    file_size: Joi.number().optional(),
    category: Joi.string().optional(),
    language: Joi.string().optional(),
    age_restriction: Joi.boolean().default(false),
    published: Joi.boolean().default(true),
    seo_title: Joi.string().optional(),
    seo_description: Joi.string().optional(),
    license_type: Joi.string().optional(),
    access_level: Joi.string().default("Free"),
    video_format: Joi.string().optional(),
    thumbnail_url: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    gallery: Joi.array().items(Joi.string()).optional(),
});

// Comment validation schemas
export const createCommentSchema = Joi.object({
    target_type: Joi.string().valid("video", "movie", "tvshow", "episode").required(),
    target_id: Joi.string().required(),
    content: Joi.string().min(1).max(1000).required(),
});

export const updateCommentSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required(),
});

// Review validation schemas
export const createReviewSchema = Joi.object({
    target_type: Joi.string().valid("video", "movie", "tvshow", "episode").required(),
    target_id: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(10).required(),
    content: Joi.string().min(1).max(2000).required(),
});

export const updateReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    content: Joi.string().min(1).max(2000).optional(),
}).min(1); // At least one field required

// Reply validation schemas
export const createReplySchema = Joi.object({
    comment_id: Joi.string().required(),
    reply_content: Joi.string().min(1).max(1000).required(),
});

export const updateReplySchema = Joi.object({
    reply_content: Joi.string().min(1).max(1000).required(),
});

// Like/Dislike validation schema
export const likeDislikeSchema = Joi.object({
    target_id: Joi.string().required(),
    target_type: Joi.string()
        .valid("video", "movie", "tvshow", "episode", "comment", "review", "comment_reply")
        .required(),
    is_like: Joi.boolean().required(),
});

// Profile update schema
export const updateProfileSchema = Joi.object({
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    profile_pic: Joi.string().uri().allow("").optional(),
    username: Joi.string().min(3).max(30).alphanum().optional(),
}).min(1); // At least one field required

// Member update schema
export const updateMemberSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().optional(),
    email: Joi.string().email().optional(),
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    profile_pic: Joi.string().uri().allow("").optional(),
    subscription_plan: Joi.string()
        .valid("Free", "Basic", "Premium", "Ultimate")
        .optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
}).min(1); // At least one field required

// Export all schemas as a default object for backward compatibility
const validationSchemas = {
    userSignupSchema,
    loginSchema,
    adminSignupSchema,
    subscriptionSchema,
    createMemberSchema,
    createVideoSchema,
    createCommentSchema,
    updateCommentSchema,
    createReviewSchema,
    updateReviewSchema,
    createReplySchema,
    updateReplySchema,
    likeDislikeSchema,
    updateProfileSchema,
    updateMemberSchema,
};

export default validationSchemas;

