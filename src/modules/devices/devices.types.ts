import type { Device } from "../../models/device.model.js";

export interface DeviceDto {
  id: string;
  user_id: string;
  device_id: string;
  device_type?: string;
  device_name?: string;
  last_used_at: Date;
  is_active: boolean;
}

export interface CreateDeviceInput {
  device_id: string;
  device_type?: "web" | "android" | "ios" | "tv";
  device_name?: string;
}

export interface UpdateDeviceInput {
  device_name?: string;
  is_active?: boolean;
}

export interface DeviceLimitCheck {
  canAdd: boolean;
  currentCount: number;
  maxDevices: number;
}

export function mapDeviceToDto(device: Device): DeviceDto {
  return {
    id: (device._id as any)?.toString?.() ?? "",
    user_id: device.user_id.toString(),
    device_id: device.device_id,
    device_type: device.device_type,
    device_name: device.device_name,
    last_used_at: device.last_used_at,
    is_active: device.is_active,
  };
}

