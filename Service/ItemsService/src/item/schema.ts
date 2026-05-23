import { Length, Min } from 'class-validator';
import {
  Field,
  Float,
  GraphQLISODateTime,
  InputType,
  Int,
  ObjectType,
} from 'type-graphql';

@ObjectType()
export class Seller {
  @Field()
  id!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class Item {
  @Field()
  id!: string;

  @Field(() => Seller)
  seller!: Seller;

  @Field()
  @Length(1, 256)
  name!: string;

  @Field()
  @Length(1, 1024)
  description!: string;

  @Field(() => [String])
  images!: string[];

  @Field()
  price!: number;

  @Field(() => GraphQLISODateTime)
  created_at!: Date;

  @Field()
  status!: 'active' | 'sold';
}

@InputType('ItemId')
export class ItemId {
  @Field()
  id!: string;
}

@InputType()
export class NewItem {
  @Field()
  @Length(1, 256)
  name!: string;

  @Field()
  @Length(1, 1024)
  description!: string;

  @Field(() => [String])
  images!: string[];

  @Field(() => Float)
  @Min(0)
  price!: number;
}

@InputType()
export class UpdateItem {
  @Field()
  id!: string;

  @Field()
  @Length(1, 256)
  name!: string;

  @Field()
  @Length(1, 1024)
  description!: string;

  @Field(() => [String])
  images!: string[];

  @Field(() => Float)
  @Min(0)
  price!: number;
}

@InputType('SellerId')
export class SellerId {
  @Field()
  id!: string;
}

@InputType('SellerItemsInput')
export class SellerItemsInput {
  @Field()
  id!: string;

  @Field()
  status!: 'active' | 'sold';
}

@InputType('RandomItemsInput')
export class RandomItemsInput {
  @Field(() => Int)
  @Min(1)
  count!: number;
}

@InputType('SearchItemsInput')
export class SearchItemsInput {
  @Field()
  @Length(1, 256)
  searchText!: string;
}
