import type { Request, Response, NextFunction } from "express";
import { TransactionsService } from "./transactions.service.js";
import logger from "../../config/logger.js";
import { createTransactionSchema, updateTransactionSchema } from "./transactions.validators.js";

const transactionsService = new TransactionsService();

export const getUserTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
      return;
    }

    const transactions = await transactionsService.getUserTransactions(userId);
    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    logger.error("Error getting user transactions:", error);
    next(error);
  }
};

export const getAllTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const transactions = await transactionsService.getAllTransactions();
    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    logger.error("Error getting all transactions:", error);
    next(error);
  }
};

export const getTransactionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    const transaction = await transactionsService.getTransactionById(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    logger.error("Error getting transaction:", error);
    next(error);
  }
};

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = createTransactionSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const transaction = await transactionsService.createTransaction(value);
    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    logger.error("Error creating transaction:", error);
    next(error);
  }
};

export const updateTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = updateTransactionSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.details.map((d) => d.message).join("; "),
        },
      });
      return;
    }

    const transaction = await transactionsService.updateTransaction(req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    logger.error("Error updating transaction:", error);
    next(error);
  }
};

