import { PageModel, type Page } from "../../models/page.model.js";
import type { CreatePageInput, UpdatePageInput } from "./pages.types.js";

export class PagesRepository {
  async findActive(): Promise<Page[]> {
    return PageModel.find({ is_active: true })
      .sort({ title: 1 })
      .exec();
  }

  async findAll(): Promise<Page[]> {
    return PageModel.find().sort({ title: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return PageModel.findOne({ slug, is_active: true }).exec();
  }

  async findById(id: string): Promise<Page | null> {
    return PageModel.findById(id).exec();
  }

  async findBySlugAdmin(slug: string): Promise<Page | null> {
    return PageModel.findOne({ slug }).exec();
  }

  async create(input: CreatePageInput): Promise<Page> {
    const doc = await PageModel.create(input);
    return doc;
  }

  async updateBySlug(slug: string, input: UpdatePageInput): Promise<Page | null> {
    return PageModel.findOneAndUpdate(
      { slug },
      input,
      { new: true, runValidators: true },
    ).exec();
  }

  async deleteBySlug(slug: string): Promise<Page | null> {
    return PageModel.findOneAndDelete({ slug }).exec();
  }
}

