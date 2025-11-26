import createError from "http-errors";
import { ProfilesRepository } from "./profiles.repository.js";
import type { CreateProfileInput, ProfileDto, UpdateProfileInput } from "./profiles.types.js";
import { mapProfileToDto } from "./profiles.types.js";

export class ProfilesService {
  private repo: ProfilesRepository;

  constructor(repo = new ProfilesRepository()) {
    this.repo = repo;
  }

  async listProfiles(userId: string): Promise<ProfileDto[]> {
    const profiles = await this.repo.findByUser(userId);
    return profiles.map(mapProfileToDto);
  }

  async createProfile(userId: string, input: CreateProfileInput): Promise<ProfileDto> {
    const profile = await this.repo.createForUser(userId, input);
    return mapProfileToDto(profile);
  }

  async updateProfile(
    userId: string,
    profileId: string,
    update: UpdateProfileInput,
  ): Promise<ProfileDto> {
    const existing = await this.repo.findById(profileId);
    if (!existing || existing.user_id.toString() !== userId) {
      throw createError(404, "Profile not found");
    }

    const updated = await this.repo.updateById(profileId, update);
    if (!updated) {
      throw createError(404, "Profile not found");
    }
    return mapProfileToDto(updated);
  }

  async deleteProfile(userId: string, profileId: string): Promise<void> {
    const existing = await this.repo.findById(profileId);
    if (!existing || existing.user_id.toString() !== userId) {
      throw createError(404, "Profile not found");
    }
    await this.repo.deleteById(profileId);
  }
}


