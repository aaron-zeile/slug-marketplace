import { IsOptional, Length, Max, Min } from 'class-validator';
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

  @Field(() => [String])
  tags!: string[];

  @Field()
  price!: number;

  @Field(() => Int)
  quantity!: number;

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

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => Float)
  @Min(0)
  price!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  quantity?: number;
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

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => Float)
  @Min(0)
  price!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  quantity?: number;
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

@InputType('FilteredItemsInput')
export class FilteredItemsInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 64)
  tag?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(5)
  minStars?: number;

  @Field({ nullable: true })
  sellerId?: string;

  @Field({ nullable: true })
  status?: 'active' | 'sold';

  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 256)
  searchText?: string;

  @Field({ nullable: true })
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc' | 'ratingDesc';

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;
}
