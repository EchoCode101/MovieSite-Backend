import Joi from "joi";

export const createTransactionSchema = Joi.object({
  user_id: Joi.string().required(),
  type: Joi.string().valid("subscription", "pay_per_view").required(),
  gateway: Joi.string().required(),
  gateway_transaction_id: Joi.string().optional(),
  status: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
  amount: Joi.number().min(0).required(),
  currency: Joi.string().optional(),
  subscription_id: Joi.string().optional(),
  ppv_id: Joi.string().optional(),
  raw_gateway_response: Joi.object().optional(),
});

export const updateTransactionSchema = Joi.object({
  status: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
  gateway_transaction_id: Joi.string().optional(),
  raw_gateway_response: Joi.object().optional(),
}).min(1);

