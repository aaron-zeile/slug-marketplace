import { IsUUID } from 'class-validator';
import { Field, InputType, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class CartItem {
  @Field()
  id!: string;

  @Field()
  member!: string;

  @Field()
  item!: string;

  @Field(() => Int)
  quantity!: number;
}

@InputType('MemberCartInput')
export class MemberCartInput {
  @Field()
  @IsUUID()
  member!: string;
}

@InputType('AddToCartInput')
export class AddToCartInput {
  @Field()
  @IsUUID()
  member!: string;

  @Field()
  @IsUUID()
  item!: string;
}

@InputType('RemoveFromCartInput')
export class RemoveFromCartInput {
  @Field()
  @IsUUID()
  member!: string;

  @Field()
  @IsUUID()
  item!: string;
}
