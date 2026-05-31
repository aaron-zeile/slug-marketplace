import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
  AddToWishlistInput,
  MemberWishlistInput,
  RemoveFromWishlistInput,
  WishlistItem,
} from './schema';
import { WishlistService } from './service';

@Resolver()
export class WishlistResolver {
  @Query(() => [WishlistItem])
  async wishlist(
    @Arg('input') input: MemberWishlistInput,
  ): Promise<WishlistItem[]> {
    return new WishlistService().getWishlist(input);
  }

  @Mutation(() => WishlistItem)
  async addToWishlist(
    @Arg('input') input: AddToWishlistInput,
  ): Promise<WishlistItem> {
    return new WishlistService().addToWishlist(input);
  }

  @Mutation(() => Boolean)
  async removeFromWishlist(
    @Arg('input') input: RemoveFromWishlistInput,
  ): Promise<boolean> {
    await new WishlistService().removeFromWishlist(input);
    return true;
  }

  @Mutation(() => Boolean)
  async clearWishlist(
    @Arg('input') input: MemberWishlistInput,
  ): Promise<boolean> {
    await new WishlistService().clearWishlist(input);
    return true;
  }
}
