import type { Page } from "../../models/page.model.js";

export interface PageDto {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
}

export interface CreatePageInput {
  slug: string;
  title: string;
  content: string;
  is_active?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  content?: string;
  is_active?: boolean;
}

export function mapPageToDto(page: Page): PageDto {
  return {
    id: (page._id as any)?.toString?.() ?? "",
    slug: page.slug,
    title: page.title,
    content: page.content,
    is_active: page.is_active,
  };
}

