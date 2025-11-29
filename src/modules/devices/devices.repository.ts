import { DeviceModel, type Device } from "../../models/device.model.js";
import type { CreateDeviceInput, UpdateDeviceInput } from "./devices.types.js";

export class DevicesRepository {
  async findByUserId(userId: string): Promise<Device[]> {
    return DeviceModel.find({ user_id: userId })
      .sort({ last_used_at: -1 })
      .exec();
  }

  async findActiveByUserId(userId: string): Promise<Device[]> {
    return DeviceModel.find({ user_id: userId, is_active: true })
      .sort({ last_used_at: -1 })
      .exec();
  }

  async findById(id: string): Promise<Device | null> {
    return DeviceModel.findById(id).exec();
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return DeviceModel.findOne({ device_id: deviceId }).exec();
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return DeviceModel.countDocuments({ user_id: userId, is_active: true }).exec();
  }

  async create(input: CreateDeviceInput, userId: string): Promise<Device> {
    // Check if device already exists
    const existing = await this.findByDeviceId(input.device_id);
    if (existing) {
      // Update existing device
      return DeviceModel.findByIdAndUpdate(
        existing._id,
        {
          ...input,
          user_id: userId,
          last_used_at: new Date(),
          is_active: true,
        },
        { new: true },
      ).exec() as Promise<Device>;
    }

    const doc = await DeviceModel.create({
      ...input,
      user_id: userId,
      last_used_at: new Date(),
    });
    return doc;
  }

  async updateById(id: string, input: UpdateDeviceInput): Promise<Device | null> {
    const update: any = { ...input };
    if (input.is_active === undefined) {
      update.last_used_at = new Date();
    }

    return DeviceModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Device | null> {
    return DeviceModel.findByIdAndDelete(id).exec();
  }
}

