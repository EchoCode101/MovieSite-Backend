import createError from "http-errors";
import { TransactionsRepository } from "./transactions.repository.js";
import type {
  CreateTransactionInput,
  TransactionDto,
  UpdateTransactionInput,
} from "./transactions.types.js";
import { mapTransactionToDto } from "./transactions.types.js";

export class TransactionsService {
  private repo: TransactionsRepository;

  constructor(repo = new TransactionsRepository()) {
    this.repo = repo;
  }

  async getUserTransactions(userId: string): Promise<TransactionDto[]> {
    const transactions = await this.repo.findByUserId(userId);
    return transactions.map(mapTransactionToDto);
  }

  async getAllTransactions(): Promise<TransactionDto[]> {
    const transactions = await this.repo.findAll();
    return transactions.map(mapTransactionToDto);
  }

  async getTransactionById(id: string, userId?: string): Promise<TransactionDto> {
    const transaction = await this.repo.findById(id);
    if (!transaction) {
      throw createError(404, "Transaction not found");
    }

    // Users can only see their own transactions unless admin
    if (userId && transaction.user_id.toString() !== userId) {
      throw createError(403, "Access denied");
    }

    return mapTransactionToDto(transaction);
  }

  async createTransaction(input: CreateTransactionInput): Promise<TransactionDto> {
    const transaction = await this.repo.create(input);
    return mapTransactionToDto(transaction);
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<TransactionDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Transaction not found");
    }

    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw createError(404, "Transaction not found");
    }
    return mapTransactionToDto(updated);
  }
}

