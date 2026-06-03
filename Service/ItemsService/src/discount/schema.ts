import { Max, Min } from 'class-validator';
import {
  Field,
  Float,
  GraphQLISODateTime,
  InputType,
  Int,
  ObjectType,
} from 'type-graphql';

@ObjectType()
export class Discount {
  @Field()
  id!: string;

  @Field()
  itemId!: string;

  @Field(() => Float)
  @Min(0)
  @Max(100)
  discountPercent!: number;

  @Field(() => Int)
  @Min(1)
  duration!: number;

  @Field(() => GraphQLISODateTime)
  created_at!: Date;
}

@InputType('DiscountId')
export class DiscountId {
  @Field()
  id!: string;
}

@InputType()
export class NewDiscount {
  @Field()
  itemId!: string;

  @Field(() => Float)
  @Min(0)
  @Max(100)
  discountPercent!: number;

  @Field(() => Int)
  @Min(1)
  duration!: number;
}
