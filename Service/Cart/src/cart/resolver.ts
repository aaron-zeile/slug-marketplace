import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
  AddToCartInput,
  CartItem,
  MemberCartInput,
  RemoveFromCartInput,
} from './schema';
import { CartService } from './service';

@Resolver()
export class CartResolver {
  @Query(() => [CartItem])
  async cart(@Arg('input') input: MemberCartInput): Promise<CartItem[]> {
    return new CartService().getCart(input);
  }

  @Mutation(() => CartItem)
  async addToCart(@Arg('input') input: AddToCartInput): Promise<CartItem> {
    return new CartService().addToCart(input);
  }

  @Mutation(() => Boolean)
  async removeFromCart(
    @Arg('input') input: RemoveFromCartInput,
  ): Promise<boolean> {
    await new CartService().removeFromCart(input);
    return true;
  }

  @Mutation(() => Boolean)
  async clearCart(@Arg('input') input: MemberCartInput): Promise<boolean> {
    await new CartService().clearCart(input);
    return true;
  }
}
