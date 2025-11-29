import createError from "http-errors";
import { DevicesRepository } from "./devices.repository.js";
import type {
  CreateDeviceInput,
  DeviceDto,
  UpdateDeviceInput,
  DeviceLimitCheck,
} from "./devices.types.js";
import { mapDeviceToDto } from "./devices.types.js";
import { SubscriptionModel } from "../../models/subscription.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { MemberModel } from "../../models/member.model.js";

export class DevicesService {
  private repo: DevicesRepository;

  constructor(repo = new DevicesRepository()) {
    this.repo = repo;
  }

  async listDevices(userId: string): Promise<DeviceDto[]> {
    const devices = await this.repo.findByUserId(userId);
    return devices.map(mapDeviceToDto);
  }

  async getDeviceById(id: string, userId: string): Promise<DeviceDto> {
    const device = await this.repo.findById(id);
    if (!device) {
      throw createError(404, "Device not found");
    }

    if (device.user_id.toString() !== userId) {
      throw createError(403, "Access denied");
    }

    return mapDeviceToDto(device);
  }

  async checkDeviceLimit(userId: string): Promise<DeviceLimitCheck> {
    // Get user's active subscription
    const subscription = await SubscriptionModel.findOne({
      user_id: userId,
      status: "active",
      ends_at: { $gt: new Date() },
    }).populate("plan_id");

    let maxDevices = 1; // Default

    if (subscription && subscription.plan_id) {
      const plan = await PlanModel.findById((subscription.plan_id as any)._id);
      if (plan) {
        maxDevices = plan.max_devices;
      }
    } else {
      // Check user's denormalized device_limit
      const user = await MemberModel.findById(userId);
      if (user && user.device_limit) {
        maxDevices = user.device_limit;
      }
    }

    const currentCount = await this.repo.countActiveByUserId(userId);

    return {
      canAdd: currentCount < maxDevices,
      currentCount,
      maxDevices,
    };
  }

  async registerDevice(input: CreateDeviceInput, userId: string): Promise<DeviceDto> {
    // Check device limit
    const limitCheck = await this.checkDeviceLimit(userId);
    if (!limitCheck.canAdd) {
      throw createError(403, `Device limit reached. Maximum ${limitCheck.maxDevices} devices allowed.`);
    }

    const device = await this.repo.create(input, userId);
    return mapDeviceToDto(device);
  }

  async updateDevice(id: string, input: UpdateDeviceInput, userId: string): Promise<DeviceDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Device not found");
    }

    if (existing.user_id.toString() !== userId) {
      throw createError(403, "Access denied");
    }

    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw createError(404, "Device not found");
    }
    return mapDeviceToDto(updated);
  }

  async deleteDevice(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Device not found");
    }

    if (existing.user_id.toString() !== userId) {
      throw createError(403, "Access denied");
    }

    await this.repo.deleteById(id);
  }
}

