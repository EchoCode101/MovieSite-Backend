import validationSchemas from "../../utils/validationSchemas.js";
import type Joi from "joi";

const {
    userSignupSchema,
    loginSchema,
    createMemberSchema,
    updateMemberSchema,
    updateProfileSchema,
    subscriptionSchema,
} = validationSchemas as {
    userSignupSchema: Joi.ObjectSchema;
    loginSchema: Joi.ObjectSchema;
    createMemberSchema: Joi.ObjectSchema;
    updateMemberSchema: Joi.ObjectSchema;
    updateProfileSchema: Joi.ObjectSchema;
    subscriptionSchema: Joi.ObjectSchema;
};

export const usersValidators = {
    userSignupSchema,
    loginSchema,
    createMemberSchema,
    updateMemberSchema,
    updateProfileSchema,
    subscriptionSchema,
};


