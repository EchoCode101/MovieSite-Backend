import createError from "http-errors";
import { PagesRepository } from "./pages.repository.js";
import type { CreatePageInput, PageDto, UpdatePageInput } from "./pages.types.js";
import { mapPageToDto } from "./pages.types.js";

export class PagesService {
  private repo: PagesRepository;

  constructor(repo = new PagesRepository()) {
    this.repo = repo;
  }

  async listActivePages(): Promise<PageDto[]> {
    const pages = await this.repo.findActive();
    return pages.map(mapPageToDto);
  }

  async listAllPages(): Promise<PageDto[]> {
    const pages = await this.repo.findAll();
    return pages.map(mapPageToDto);
  }

  async getPageBySlug(slug: string): Promise<PageDto> {
    const page = await this.repo.findBySlug(slug);
    if (!page) {
      throw createError(404, "Page not found");
    }
    return mapPageToDto(page);
  }

  async getPageBySlugAdmin(slug: string): Promise<PageDto> {
    const page = await this.repo.findBySlugAdmin(slug);
    if (!page) {
      throw createError(404, "Page not found");
    }
    return mapPageToDto(page);
  }

  async createPage(input: CreatePageInput): Promise<PageDto> {
    // Check if slug already exists
    const existing = await this.repo.findBySlugAdmin(input.slug);
    if (existing) {
      throw createError(409, "Page with this slug already exists");
    }

    const page = await this.repo.create(input);
    return mapPageToDto(page);
  }

  async updatePage(slug: string, input: UpdatePageInput): Promise<PageDto> {
    const existing = await this.repo.findBySlugAdmin(slug);
    if (!existing) {
      throw createError(404, "Page not found");
    }

    const updated = await this.repo.updateBySlug(slug, input);
    if (!updated) {
      throw createError(404, "Page not found");
    }
    return mapPageToDto(updated);
  }

  async deletePage(slug: string): Promise<void> {
    const existing = await this.repo.findBySlugAdmin(slug);
    if (!existing) {
      throw createError(404, "Page not found");
    }
    await this.repo.deleteBySlug(slug);
  }
}

