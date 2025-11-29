import type { CastCrew } from "../../models/castCrew.model.js";

export interface CastCrewDto {
  id: string;
  name: string;
  type: string;
  bio?: string;
  image_url?: string;
}

export interface CreateCastCrewInput {
  name: string;
  type: "actor" | "director" | "writer" | "crew";
  bio?: string;
  image_url?: string;
}

export interface UpdateCastCrewInput {
  name?: string;
  type?: "actor" | "director" | "writer" | "crew";
  bio?: string;
  image_url?: string;
}

export interface CastCrewFilters {
  type?: "actor" | "director" | "writer" | "crew";
  search?: string;
}

export function mapCastCrewToDto(castCrew: CastCrew): CastCrewDto {
  return {
    id: (castCrew._id as any)?.toString?.() ?? "",
    name: castCrew.name,
    type: castCrew.type,
    bio: castCrew.bio,
    image_url: castCrew.image_url,
  };
}

