import Joi from "joi";

const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
export default userSchema;
