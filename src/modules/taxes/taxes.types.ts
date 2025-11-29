import type { Tax } from "../../models/tax.model.js";

export interface TaxDto {
  id: string;
  name: string;
  country?: string;
  rate_percent: number;
  is_active: boolean;
}

export interface CreateTaxInput {
  name: string;
  country?: string;
  rate_percent: number;
  is_active?: boolean;
}

export interface UpdateTaxInput {
  name?: string;
  country?: string;
  rate_percent?: number;
  is_active?: boolean;
}

export function mapTaxToDto(tax: Tax): TaxDto {
  return {
    id: (tax._id as any)?.toString?.() ?? "",
    name: tax.name,
    country: tax.country,
    rate_percent: tax.rate_percent,
    is_active: tax.is_active,
  };
}

