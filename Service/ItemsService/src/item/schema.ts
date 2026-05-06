import { Length } from 'class-validator';
import { Field, GraphQLISODateTime, InputType, ObjectType } from 'type-graphql';

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
}

@InputType('ItemId')
export class ItemId {
  @Field()
  id!: string;
}
