import { Types } from "mongoose";
import { ChannelModel, type Channel } from "../../models/channel.model.js";
import type { CreateChannelInput, UpdateChannelInput } from "./channels.types.js";

export class ChannelsRepository {
  async findActive(): Promise<Channel[]> {
    return ChannelModel.find({
      deleted_at: null,
      is_active: true,
    })
      .sort({ sort_order: 1, name: 1 })
      .exec();
  }

  async findAll(): Promise<Channel[]> {
    return ChannelModel.find({ deleted_at: null })
      .sort({ sort_order: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Channel | null> {
    return ChannelModel.findOne({ _id: id, deleted_at: null }).exec();
  }

  async findBySlug(slug: string): Promise<Channel | null> {
    return ChannelModel.findOne({ slug, deleted_at: null }).exec();
  }

  async create(input: CreateChannelInput, userId: string): Promise<Channel> {
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = await this.findBySlug(slug);
    if (existing) {
      throw new Error("Channel with this slug already exists");
    }

    const doc = await ChannelModel.create({
      ...input,
      slug,
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateChannelInput, userId?: string): Promise<Channel | null> {
    const update: any = { ...input };
    if (userId) {
      update.updated_by = new Types.ObjectId(userId);
    }

    if (input.slug) {
      const existing = await this.findBySlug(input.slug);
      if (existing && (existing._id as any).toString() !== id) {
        throw new Error("Channel with this slug already exists");
      }
    }

    return ChannelModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Channel | null> {
    return ChannelModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true },
    ).exec();
  }
}

