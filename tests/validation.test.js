import Joi from "joi";
import passwordSchema from "../Utilities/passwordValidator.js";

const schema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
});

test("Validates correct input", () => {
  const validData = { username: "Hamza", email: "hamza@example.com" };
  const { error } = schema.validate(validData);
  expect(error).toBeUndefined();
});

test("Rejects invalid input", () => {
  const invalidData = { username: "Ha", email: "invalid-email" };
  const { error } = schema.validate(invalidData);
  expect(error).toBeDefined();
});

test("Rejects weak passwords", () => {
  const result = passwordSchema.validate("weakpass", { details: true });
  expect(result.length).not.toEqual(0); // Weak password should return non-empty array
});

test("Accepts strong passwords", () => {
  const result = passwordSchema.validate("StrongPass1", { details: true });
  expect(result.length).toEqual(0); // Strong password should return an empty array
});
