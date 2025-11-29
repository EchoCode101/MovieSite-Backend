import createError from "http-errors";
import { PaymentMethodsRepository } from "./paymentMethods.repository.js";
import type {
  CreatePaymentMethodInput,
  PaymentMethodDto,
  PaymentMethodAdminDto,
  UpdatePaymentMethodInput,
} from "./paymentMethods.types.js";
import { mapPaymentMethodToDto } from "./paymentMethods.types.js";

export class PaymentMethodsService {
  private repo: PaymentMethodsRepository;

  constructor(repo = new PaymentMethodsRepository()) {
    this.repo = repo;
  }

  async listActivePaymentMethods(): Promise<PaymentMethodDto[]> {
    const methods = await this.repo.findActive();
    return methods.map((m) => mapPaymentMethodToDto(m, false) as PaymentMethodDto);
  }

  async listAllPaymentMethods(): Promise<PaymentMethodAdminDto[]> {
    const methods = await this.repo.findAll();
    return methods.map((m) => mapPaymentMethodToDto(m, true) as PaymentMethodAdminDto);
  }

  async getPaymentMethodById(id: string, includeConfig = false): Promise<PaymentMethodDto | PaymentMethodAdminDto> {
    const method = await this.repo.findById(id);
    if (!method) {
      throw createError(404, "Payment method not found");
    }
    return mapPaymentMethodToDto(method, includeConfig);
  }

  async createPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethodAdminDto> {
    // Check if name already exists
    const existing = await this.repo.findByName(input.name);
    if (existing) {
      throw createError(409, "Payment method with this name already exists");
    }

    const method = await this.repo.create(input);
    return mapPaymentMethodToDto(method, true) as PaymentMethodAdminDto;
  }

  async updatePaymentMethod(id: string, input: UpdatePaymentMethodInput): Promise<PaymentMethodAdminDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Payment method not found");
    }

    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw createError(404, "Payment method not found");
    }
    return mapPaymentMethodToDto(updated, true) as PaymentMethodAdminDto;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw createError(404, "Payment method not found");
    }
    await this.repo.deleteById(id);
  }
}

