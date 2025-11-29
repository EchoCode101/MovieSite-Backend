import type { PayPerView } from "../../models/payPerView.model.js";

export interface PayPerViewDto {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  price: number;
  currency: string;
  purchase_type: string;
  access_duration_hours?: number;
  purchased_at: Date;
  expires_at?: Date;
}

export interface CreatePayPerViewInput {
  user_id: string;
  target_type: "movie" | "episode";
  target_id: string;
  price: number;
  currency?: string;
  purchase_type?: "rent" | "buy";
  access_duration_hours?: number;
}

export interface AccessCheckResult {
  hasAccess: boolean;
  purchase?: PayPerViewDto;
  expiresAt?: Date;
  message?: string;
}

export function mapPayPerViewToDto(ppv: PayPerView): PayPerViewDto {
  return {
    id: (ppv._id as any)?.toString?.() ?? "",
    user_id: ppv.user_id.toString(),
    target_type: ppv.target_type,
    target_id: ppv.target_id.toString(),
    price: ppv.price,
    currency: ppv.currency,
    purchase_type: ppv.purchase_type,
    access_duration_hours: ppv.access_duration_hours,
    purchased_at: ppv.purchased_at,
    expires_at: ppv.expires_at,
  };
}

