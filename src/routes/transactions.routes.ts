import { Router } from "express";
import { authenticateToken, authenticateAdminToken } from "../middlewares/auth.middleware.js";
import {
  getUserTransactionsController,
  getAllTransactionsController,
  getTransactionByIdController,
  createTransactionController,
  updateTransactionController,
} from "../modules/transactions/transactions.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../modules/transactions/transactions.validators.js";

const router = Router();

// Authenticated user routes
router.get("/", authenticateToken, getUserTransactionsController);
router.get("/:id", authenticateToken, getTransactionByIdController);

// Admin routes
router.get("/admin/all", authenticateAdminToken, getAllTransactionsController);
router.post("/", authenticateAdminToken, validate(createTransactionSchema), createTransactionController);
router.put("/:id", authenticateAdminToken, validate(updateTransactionSchema), updateTransactionController);

export default router;

