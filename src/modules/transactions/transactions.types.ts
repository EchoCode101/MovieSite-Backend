import type { Transaction } from "../../models/transaction.model.js";

export interface TransactionDto {
  id: string;
  user_id: string;
  type: string;
  gateway: string;
  gateway_transaction_id?: string;
  status: string;
  amount: number;
  currency: string;
  subscription_id?: string;
  ppv_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  user_id: string;
  type: "subscription" | "pay_per_view";
  gateway: string;
  gateway_transaction_id?: string;
  status?: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  currency?: string;
  subscription_id?: string;
  ppv_id?: string;
  raw_gateway_response?: Record<string, unknown>;
}

export interface UpdateTransactionInput {
  status?: "pending" | "paid" | "failed" | "refunded";
  gateway_transaction_id?: string;
  raw_gateway_response?: Record<string, unknown>;
}

export function mapTransactionToDto(transaction: Transaction): TransactionDto {
  return {
    id: (transaction._id as any)?.toString?.() ?? "",
    user_id: transaction.user_id.toString(),
    type: transaction.type,
    gateway: transaction.gateway,
    gateway_transaction_id: transaction.gateway_transaction_id,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    subscription_id: transaction.subscription_id?.toString(),
    ppv_id: transaction.ppv_id?.toString(),
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

