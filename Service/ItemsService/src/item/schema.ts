import { Length } from 'class-validator';
import { Field, GraphQLISODateTime, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class Item {
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
