import type { Profile } from "../../models/profile.model.js";

export interface ProfileDto {
  id: string;
  name: string;
  avatar_url?: string;
  is_kid: boolean;
  language: string;
  autoplay_next: boolean;
  autoplay_trailers: boolean;
  has_pin?: boolean; // Indicates if profile has PIN protection (without exposing the PIN)
}

export interface CreateProfileInput {
  name: string;
  avatar_url?: string;
  is_kid?: boolean;
  language?: string;
  pin?: string;
}

export interface UpdateProfileInput {
  name?: string;
  avatar_url?: string;
  is_kid?: boolean;
  language?: string;
  pin?: string;
  autoplay_next?: boolean;
  autoplay_trailers?: boolean;
}

export function mapProfileToDto(profile: Profile): ProfileDto {
  return {
    id: (profile._id as any)?.toString?.() ?? "",
    name: profile.name,
    avatar_url: profile.avatar_url,
    is_kid: profile.is_kid,
    language: profile.language,
    autoplay_next: profile.autoplay_next,
    autoplay_trailers: profile.autoplay_trailers,
    has_pin: !!(profile.is_kid && profile.pin), // Only indicate if PIN exists, don't expose the PIN
  };
}


