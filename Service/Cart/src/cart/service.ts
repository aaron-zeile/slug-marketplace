import { addToCart, clearCart, getCart, removeFromCart } from './db';
import {
  AddToCartInput,
  CartItem,
  MemberCartInput,
  RemoveFromCartInput,
} from './schema';

export class CartService {
  public async getCart(input: MemberCartInput): Promise<CartItem[]> {
    return getCart(input);
  }

  public async addToCart(input: AddToCartInput): Promise<CartItem> {
    return addToCart(input);
  }

  public async removeFromCart(input: RemoveFromCartInput): Promise<void> {
    await removeFromCart(input);
  }

  public async clearCart(input: MemberCartInput): Promise<void> {
    await clearCart(input);
  }
}
