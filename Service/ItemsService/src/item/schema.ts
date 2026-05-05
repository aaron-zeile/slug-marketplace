import { Length } from 'class-validator';
import { Field, GraphQLISODateTime, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class Item {
  constructor(
    id: string,
    seller: string,
    name: string,
    description: string,
    price: number,
    created_at: Date,
  ) {
    this.id = id;
    this.seller = seller;
    this.name = name;
    this.description = description;
    this.price = price;
    this.created_at = created_at;
  }

  @Field()
  id!: string;
  @Field()
  seller!: string;
  @Field()
  @Length(1, 256)
  name!: string;
  @Field()
  @Length(1, 1024)
  description!: string;
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
