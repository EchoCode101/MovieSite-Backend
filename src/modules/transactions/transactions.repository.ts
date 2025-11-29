import { Types } from "mongoose";
import { TransactionModel, type Transaction } from "../../models/transaction.model.js";
import type { CreateTransactionInput, UpdateTransactionInput } from "./transactions.types.js";

export class TransactionsRepository {
  async findByUserId(userId: string): Promise<Transaction[]> {
    return TransactionModel.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<Transaction[]> {
    return TransactionModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Transaction | null> {
    return TransactionModel.findById(id).exec();
  }

  async findByGatewayTransactionId(gatewayTransactionId: string): Promise<Transaction | null> {
    return TransactionModel.findOne({ gateway_transaction_id: gatewayTransactionId }).exec();
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const doc = await TransactionModel.create({
      ...input,
      user_id: new Types.ObjectId(input.user_id),
      subscription_id: input.subscription_id ? new Types.ObjectId(input.subscription_id) : undefined,
      ppv_id: input.ppv_id ? new Types.ObjectId(input.ppv_id) : undefined,
      currency: input.currency || "USD",
      status: input.status || "pending",
    });
    return doc;
  }

  async updateById(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    return TransactionModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).exec();
  }
}

