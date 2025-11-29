import type { PaymentMethod } from "../../models/paymentMethod.model.js";

export interface PaymentMethodDto {
  id: string;
  name: string;
  display_name?: string;
  is_active: boolean;
  is_default: boolean;
}

export interface PaymentMethodAdminDto extends PaymentMethodDto {
  config: Record<string, unknown>;
}

export interface CreatePaymentMethodInput {
  name: string;
  display_name?: string;
  config: Record<string, unknown>;
  is_active?: boolean;
  is_default?: boolean;
}

export interface UpdatePaymentMethodInput {
  display_name?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
  is_default?: boolean;
}

export function mapPaymentMethodToDto(paymentMethod: PaymentMethod, includeConfig = false): PaymentMethodDto | PaymentMethodAdminDto {
  const base = {
    id: (paymentMethod._id as any)?.toString?.() ?? "",
    name: paymentMethod.name,
    display_name: paymentMethod.display_name,
    is_active: paymentMethod.is_active,
    is_default: paymentMethod.is_default,
  };

  if (includeConfig) {
    return {
      ...base,
      config: paymentMethod.config,
    } as PaymentMethodAdminDto;
  }

  return base;
}

