import createError from "http-errors";
import { TaxesRepository } from "./taxes.repository.js";
import type { CreateTaxInput, TaxDto, UpdateTaxInput } from "./taxes.types.js";
import { mapTaxToDto } from "./taxes.types.js";

export class TaxesService {
  private repo: TaxesRepository;

  constructor(repo = new TaxesRepository()) {
    this.repo = repo;
  }

  async listTaxes(): Promise<TaxDto[]> {
    const taxes = await this.repo.findAll();
    return taxes.map(mapTaxToDto);
  }

  async getTaxById(id: string): Promise<TaxDto> {
    const tax = await this.repo.findById(id);
    if (!tax) {
      throw createError(404, "Tax not found");
    }
    return mapTaxToDto(tax);
  }

  async getTaxByCountry(country: string): Promise<TaxDto | null> {
    const tax = await this.repo.findByCountry(country);
    return tax ? mapTaxToDto(tax) : null;
  }

  async calculateTax(amount: number, country?: string): Promise<number> {
    let taxRate = 0;

    if (country) {
      const tax = await this.repo.findByCountry(country);
      if (tax) {
        taxRate = tax.rate_percent;
      }
    } else {
      // Default tax rate if no country specified
      const activeTaxes = await this.repo.findActive();
      if (activeTaxes.length > 0) {
        taxRate = activeTaxes[0].rate_percent;
      }
    }

    return (amount * taxRate) / 100;
  }

  async createTax(input: CreateTaxInput): Promise<TaxDto> {
    const tax = await this.repo.create(input);
    return mapTaxToDto(tax);
  }

  async updateTax(id: string, input: UpdateTaxInput): Promise<TaxDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Tax not found");
    }

    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw createError(404, "Tax not found");
    }
    return mapTaxToDto(updated);
  }

  async deleteTax(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Tax not found");
    }
    await this.repo.deleteById(id);
  }
}

