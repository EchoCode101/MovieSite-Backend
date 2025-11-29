import { PaymentMethodModel, type PaymentMethod } from "../../models/paymentMethod.model.js";
import type { CreatePaymentMethodInput, UpdatePaymentMethodInput } from "./paymentMethods.types.js";

export class PaymentMethodsRepository {
  async findActive(): Promise<PaymentMethod[]> {
    return PaymentMethodModel.find({ is_active: true })
      .sort({ is_default: -1, name: 1 })
      .exec();
  }

  async findAll(): Promise<PaymentMethod[]> {
    return PaymentMethodModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    return PaymentMethodModel.findById(id).exec();
  }

  async findByName(name: string): Promise<PaymentMethod | null> {
    return PaymentMethodModel.findOne({ name: name.toLowerCase() }).exec();
  }

  async findDefault(): Promise<PaymentMethod | null> {
    return PaymentMethodModel.findOne({ is_default: true, is_active: true }).exec();
  }

  async create(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    // If setting as default, unset other defaults
    if (input.is_default) {
      await PaymentMethodModel.updateMany({ is_default: true }, { is_default: false });
    }

    const doc = await PaymentMethodModel.create({
      ...input,
      name: input.name.toLowerCase(),
    });
    return doc;
  }

  async updateById(id: string, input: UpdatePaymentMethodInput): Promise<PaymentMethod | null> {
    // If setting as default, unset other defaults
    if (input.is_default) {
      await PaymentMethodModel.updateMany(
        { is_default: true, _id: { $ne: id } },
        { is_default: false },
      );
    }

    return PaymentMethodModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<PaymentMethod | null> {
    return PaymentMethodModel.findByIdAndDelete(id).exec();
  }
}

