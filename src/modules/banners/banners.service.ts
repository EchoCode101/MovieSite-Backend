import createError from "http-errors";
import { BannersRepository } from "./banners.repository.js";
import type {
  CreateBannerInput,
  BannerDto,
  UpdateBannerInput,
  BannerFilters,
} from "./banners.types.js";
import { mapBannerToDto } from "./banners.types.js";

export class BannersService {
  private repo: BannersRepository;

  constructor(repo = new BannersRepository()) {
    this.repo = repo;
  }

  async listActiveBanners(filters?: BannerFilters): Promise<BannerDto[]> {
    const banners = await this.repo.findActive(filters);
    return banners.map(mapBannerToDto);
  }

  async listAllBanners(): Promise<BannerDto[]> {
    const banners = await this.repo.findAll();
    return banners.map(mapBannerToDto);
  }

  async getBannerById(id: string): Promise<BannerDto> {
    const banner = await this.repo.findById(id);
    if (!banner) {
      throw createError(404, "Banner not found");
    }
    return mapBannerToDto(banner);
  }

  async createBanner(input: CreateBannerInput, userId: string): Promise<BannerDto> {
    if (!input.image_url) {
      throw createError(400, "Image URL is required");
    }

    const banner = await this.repo.create(input, userId);
    return mapBannerToDto(banner);
  }

  async updateBanner(id: string, input: UpdateBannerInput, userId: string): Promise<BannerDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Banner not found");
    }

    const updated = await this.repo.updateById(id, input, userId);
    if (!updated) {
      throw createError(404, "Banner not found");
    }
    return mapBannerToDto(updated);
  }

  async deleteBanner(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Banner not found");
    }
    await this.repo.deleteById(id);
  }
}

