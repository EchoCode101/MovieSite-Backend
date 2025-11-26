import { ProfileModel, type Profile } from "../../models/profile.model.js";
import type { CreateProfileInput, UpdateProfileInput } from "./profiles.types.js";

export class ProfilesRepository {
  async findByUser(userId: string): Promise<Profile[]> {
    return ProfileModel.find({ user_id: userId }).sort({ createdAt: 1 }).exec();
  }

  async createForUser(userId: string, input: CreateProfileInput): Promise<Profile> {
    const doc = await ProfileModel.create({
      user_id: userId,
      ...input,
    });
    return doc;
  }

  async findById(id: string): Promise<Profile | null> {
    return ProfileModel.findById(id).exec();
  }

  async updateById(id: string, update: UpdateProfileInput): Promise<Profile | null> {
    return ProfileModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Profile | null> {
    return ProfileModel.findByIdAndDelete(id).exec();
  }
}


