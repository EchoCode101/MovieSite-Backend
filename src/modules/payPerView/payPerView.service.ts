import createError from "http-errors";
import { PayPerViewRepository } from "./payPerView.repository.js";
import type {
  CreatePayPerViewInput,
  PayPerViewDto,
  AccessCheckResult,
} from "./payPerView.types.js";
import { mapPayPerViewToDto } from "./payPerView.types.js";
import { MovieModel } from "../../models/movie.model.js";
import { EpisodeModel } from "../../models/episode.model.js";

export class PayPerViewService {
  private repo: PayPerViewRepository;

  constructor(repo = new PayPerViewRepository()) {
    this.repo = repo;
  }

  async getUserPurchases(userId: string): Promise<PayPerViewDto[]> {
    const purchases = await this.repo.findByUserId(userId);
    return purchases.map(mapPayPerViewToDto);
  }

  async getPurchaseById(id: string, userId: string): Promise<PayPerViewDto> {
    const purchase = await this.repo.findById(id);
    if (!purchase) {
      throw createError(404, "Purchase not found");
    }

    if (purchase.user_id.toString() !== userId) {
      throw createError(403, "Access denied");
    }

    return mapPayPerViewToDto(purchase);
  }

  async checkAccess(
    userId: string,
    targetType: "movie" | "episode",
    targetId: string,
  ): Promise<AccessCheckResult> {
    const purchase = await this.repo.findByTarget(userId, targetType, targetId);
    if (!purchase) {
      return {
        hasAccess: false,
        message: "Content not purchased",
      };
    }

    // For "buy" type, access is permanent
    if (purchase.purchase_type === "buy") {
      return {
        hasAccess: true,
        purchase: mapPayPerViewToDto(purchase),
      };
    }

    // For "rent" type, check expiration
    if (purchase.purchase_type === "rent") {
      if (purchase.expires_at && purchase.expires_at < new Date()) {
        return {
          hasAccess: false,
          purchase: mapPayPerViewToDto(purchase),
          expiresAt: purchase.expires_at,
          message: "Rental period has expired",
        };
      }
      return {
        hasAccess: true,
        purchase: mapPayPerViewToDto(purchase),
        expiresAt: purchase.expires_at,
      };
    }

    return {
      hasAccess: false,
      message: "Invalid purchase type",
    };
  }

  async purchaseContent(input: CreatePayPerViewInput): Promise<PayPerViewDto> {
    // Verify content exists
    if (input.target_type === "movie") {
      const movie = await MovieModel.findById(input.target_id);
      if (!movie) {
        throw createError(404, "Movie not found");
      }
      if (movie.access_type !== "pay_per_view") {
        throw createError(400, "Movie is not available for pay-per-view");
      }
      if (!movie.pay_per_view_price) {
        throw createError(400, "Movie does not have a pay-per-view price");
      }
      // Use movie's price if not provided
      if (!input.price) {
        input.price = movie.pay_per_view_price;
      }
      if (movie.access_duration_hours && !input.access_duration_hours) {
        input.access_duration_hours = movie.access_duration_hours;
      }
    } else if (input.target_type === "episode") {
      const episode = await EpisodeModel.findById(input.target_id);
      if (!episode) {
        throw createError(404, "Episode not found");
      }
      if (episode.access_type !== "pay_per_view") {
        throw createError(400, "Episode is not available for pay-per-view");
      }
      if (!episode.pay_per_view_price) {
        throw createError(400, "Episode does not have a pay-per-view price");
      }
      if (!input.price) {
        input.price = episode.pay_per_view_price;
      }
    }

    // Check if already purchased
    const existing = await this.repo.findByTarget(
      input.user_id,
      input.target_type,
      input.target_id,
    );
    if (existing) {
      // Check if it's a buy (permanent) or valid rent
      const accessCheck = await this.checkAccess(
        input.user_id,
        input.target_type,
        input.target_id,
      );
      if (accessCheck.hasAccess) {
        throw createError(409, "Content already purchased and accessible");
      }
      // If expired, allow repurchase
    }

    const purchase = await this.repo.create(input);
    return mapPayPerViewToDto(purchase);
  }
}

