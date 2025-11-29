import type { Banner } from "../../models/banner.model.js";

export interface BannerDto {
  id: string;
  title?: string;
  device: string;
  position: string;
  target_type: string;
  target_id: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface CreateBannerInput {
  title?: string;
  device?: "web" | "mobile" | "tv";
  position?: "home" | "movie" | "tv" | "video";
  target_type: "movie" | "tvshow" | "episode";
  target_id: string;
  image_url: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateBannerInput {
  title?: string;
  device?: "web" | "mobile" | "tv";
  position?: "home" | "movie" | "tv" | "video";
  target_type?: "movie" | "tvshow" | "episode";
  target_id?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface BannerFilters {
  device?: "web" | "mobile" | "tv";
  position?: "home" | "movie" | "tv" | "video";
}

export function mapBannerToDto(banner: Banner): BannerDto {
  return {
    id: (banner._id as any)?.toString?.() ?? "",
    title: banner.title,
    device: banner.device,
    position: banner.position,
    target_type: banner.target_type,
    target_id: banner.target_id.toString(),
    image_url: banner.image_url,
    sort_order: banner.sort_order,
    is_active: banner.is_active,
  };
}

