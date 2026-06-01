import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
} from './db';
import {
  AddToWishlistInput,
  MemberWishlistInput,
  RemoveFromWishlistInput,
  WishlistItem,
} from './schema';

export class WishlistService {
  public async getWishlist(input: MemberWishlistInput): Promise<WishlistItem[]> {
    return getWishlist(input);
  }

  public async addToWishlist(input: AddToWishlistInput): Promise<WishlistItem> {
    return addToWishlist(input);
  }

  public async removeFromWishlist(
    input: RemoveFromWishlistInput,
  ): Promise<void> {
    await removeFromWishlist(input);
  }

  public async clearWishlist(input: MemberWishlistInput): Promise<void> {
    await clearWishlist(input);
  }
}
