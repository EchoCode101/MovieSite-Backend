import createError from "http-errors";
import { CastCrewRepository } from "./castCrew.repository.js";
import type {
  CreateCastCrewInput,
  CastCrewDto,
  UpdateCastCrewInput,
  CastCrewFilters,
} from "./castCrew.types.js";
import { mapCastCrewToDto } from "./castCrew.types.js";

export class CastCrewService {
  private repo: CastCrewRepository;

  constructor(repo = new CastCrewRepository()) {
    this.repo = repo;
  }

  async listCastCrew(filters?: CastCrewFilters): Promise<CastCrewDto[]> {
    const castCrew = await this.repo.findAll(filters);
    return castCrew.map(mapCastCrewToDto);
  }

  async getCastCrewById(id: string): Promise<CastCrewDto> {
    const castCrew = await this.repo.findById(id);
    if (!castCrew) {
      throw createError(404, "Cast/Crew member not found");
    }
    return mapCastCrewToDto(castCrew);
  }

  async createCastCrew(input: CreateCastCrewInput): Promise<CastCrewDto> {
    const castCrew = await this.repo.create(input);
    return mapCastCrewToDto(castCrew);
  }

  async updateCastCrew(id: string, update: UpdateCastCrewInput): Promise<CastCrewDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Cast/Crew member not found");
    }

    const updated = await this.repo.updateById(id, update);
    if (!updated) {
      throw createError(404, "Cast/Crew member not found");
    }
    return mapCastCrewToDto(updated);
  }

  async deleteCastCrew(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Cast/Crew member not found");
    }
    await this.repo.deleteById(id);
  }
}

