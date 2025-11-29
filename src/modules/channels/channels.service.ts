import createError from "http-errors";
import { ChannelsRepository } from "./channels.repository.js";
import type {
  CreateChannelInput,
  ChannelDto,
  UpdateChannelInput,
} from "./channels.types.js";
import { mapChannelToDto } from "./channels.types.js";

export class ChannelsService {
  private repo: ChannelsRepository;

  constructor(repo = new ChannelsRepository()) {
    this.repo = repo;
  }

  async listActiveChannels(): Promise<ChannelDto[]> {
    const channels = await this.repo.findActive();
    return channels.map(mapChannelToDto);
  }

  async listAllChannels(): Promise<ChannelDto[]> {
    const channels = await this.repo.findAll();
    return channels.map(mapChannelToDto);
  }

  async getChannelById(id: string): Promise<ChannelDto> {
    const channel = await this.repo.findById(id);
    if (!channel) {
      throw createError(404, "Channel not found");
    }
    return mapChannelToDto(channel);
  }

  async createChannel(input: CreateChannelInput, userId: string): Promise<ChannelDto> {
    if (!input.name) {
      throw createError(400, "Name is required");
    }

    const channel = await this.repo.create(input, userId);
    return mapChannelToDto(channel);
  }

  async updateChannel(id: string, input: UpdateChannelInput, userId: string): Promise<ChannelDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Channel not found");
    }

    const updated = await this.repo.updateById(id, input, userId);
    if (!updated) {
      throw createError(404, "Channel not found");
    }
    return mapChannelToDto(updated);
  }

  async deleteChannel(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Channel not found");
    }
    await this.repo.deleteById(id);
  }
}

