import type { Channel } from "../../models/channel.model.js";

export interface ChannelDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  stream_url?: string;
  stream_type?: string;
  language?: string;
  country?: string;
  category?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface CreateChannelInput {
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  stream_url?: string;
  stream_type?: "hls" | "dash" | "mp4";
  language?: string;
  country?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface UpdateChannelInput {
  name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  stream_url?: string;
  stream_type?: "hls" | "dash" | "mp4";
  language?: string;
  country?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export function mapChannelToDto(channel: Channel): ChannelDto {
  return {
    id: (channel._id as any)?.toString?.() ?? "",
    name: channel.name,
    slug: channel.slug,
    description: channel.description,
    logo_url: channel.logo_url,
    banner_url: channel.banner_url,
    stream_url: channel.stream_url,
    stream_type: channel.stream_type,
    language: channel.language,
    country: channel.country,
    category: channel.category,
    is_active: channel.is_active,
    is_featured: channel.is_featured,
    sort_order: channel.sort_order,
  };
}

