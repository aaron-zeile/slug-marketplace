import { IsUUID } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class WishlistItem {
  @Field()
  id!: string;

  @Field()
  member!: string;

  @Field()
  item!: string;

  @Field()
  createdAt!: Date;
}

@InputType('MemberWishlistInput')
export class MemberWishlistInput {
  @Field()
  @IsUUID()
  member!: string;
}

@InputType('AddToWishlistInput')
export class AddToWishlistInput {
  @Field()
  @IsUUID()
  member!: string;

  @Field()
  @IsUUID()
  item!: string;
}

@InputType('RemoveFromWishlistInput')
export class RemoveFromWishlistInput {
  @Field()
  @IsUUID()
  member!: string;

  @Field()
  @IsUUID()
  item!: string;
}
