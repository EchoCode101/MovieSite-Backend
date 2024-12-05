import validationSchemas from "./validationSchemas.js";
const { userSchema, loginSchema } = validationSchemas;
import validator from "validator"; // CommonJS-style import for validator
const { escape } = validator; // Destructure escape method

// A function to validate and sanitize input
function validateAndSanitizeUserInput(input) {
  // Validate the input using Joi schema
  const { error, value } = loginSchema.validate(input);

  if (error) {
    throw new Error("Validation failed");
  }

  // Sanitize values to prevent XSS or other attacks using escape
  value.email = escape(value.email); // Clean input
  value.password = escape(value.password); // Clean input (but remember passwords should be hashed)

  return value;
}

export default validateAndSanitizeUserInput;
