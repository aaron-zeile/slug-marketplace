import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
  MemberViewedItemsInput,
  RecordViewedItemInput,
  ViewedItem,
} from './schema';
import { ViewedItemsService } from './service';

@Resolver()
export class ViewedItemsResolver {
  @Query(() => [ViewedItem])
  async viewedItems(
    @Arg('input') input: MemberViewedItemsInput,
  ): Promise<ViewedItem[]> {
    return new ViewedItemsService().getViewedItems(input);
  }

  @Mutation(() => ViewedItem)
  async recordViewedItem(
    @Arg('input') input: RecordViewedItemInput,
  ): Promise<ViewedItem> {
    return new ViewedItemsService().recordViewedItem(input);
  }
}
