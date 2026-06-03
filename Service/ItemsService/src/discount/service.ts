import type { SessionUser } from '../auth/service';
import { ItemId } from '../item/schema';
import {
  deleteDiscountById,
  getDiscount,
  getDiscountsByItem,
  insertDiscount,
} from './db';
import { Discount, DiscountId, NewDiscount } from './schema';

export class DiscountService {
  public async createDiscount(
    sessionUser: SessionUser,
    input: NewDiscount,
  ): Promise<Discount> {
    const discount = await insertDiscount({
      input,
      sellerId: sessionUser.id,
    });

    if (!discount) {
      throw new Error('Item not found or user does not own item');
    }

    return discount;
  }

  public async getDiscount(input: DiscountId): Promise<Discount | undefined> {
    return getDiscount(input.id);
  }

  public async getDiscountsByItem(input: ItemId): Promise<Discount[]> {
    return getDiscountsByItem(input);
  }

  public async deleteDiscount(
    sessionUser: SessionUser,
    input: DiscountId,
  ): Promise<void> {
    const deleted = await deleteDiscountById(input.id, sessionUser.id);

    if (!deleted) {
      throw new Error('Discount not found or user does not own item');
    }
  }
}
