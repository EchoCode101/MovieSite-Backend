import { Router } from "express";
import { authenticateToken, limiter } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  addToWatchlistController,
  removeFromWatchlistController,
  getWatchlistController,
  updateWatchProgressController,
  getContinueWatchingController,
  removeWatchHistoryController,
} from "../modules/watch/watch.controller.js";
import { watchValidators } from "../modules/watch/watch.validators.js";

const router = Router();

// Watchlist routes
router.post(
  "/watchlist",
  authenticateToken,
  limiter,
  validate(watchValidators.addToWatchlistSchema),
  addToWatchlistController,
);

router.delete(
  "/watchlist",
  authenticateToken,
  limiter,
  removeFromWatchlistController,
);

router.get(
  "/watchlist",
  authenticateToken,
  validate(watchValidators.getWatchlistQuerySchema, { target: "query" }),
  getWatchlistController,
);

// Continue watching / Watch history routes
router.post(
  "/progress",
  authenticateToken,
  limiter,
  validate(watchValidators.updateWatchProgressSchema),
  updateWatchProgressController,
);

router.get(
  "/continue-watching",
  authenticateToken,
  validate(watchValidators.getContinueWatchingQuerySchema, { target: "query" }),
  getContinueWatchingController,
);

router.delete(
  "/history",
  authenticateToken,
  limiter,
  removeWatchHistoryController,
);

export default router;

