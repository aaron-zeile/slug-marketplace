import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class AuthPayload {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class MonthlyProfit {
  @Field(() => String)
  month!: string;

  @Field(() => Number)
  profit!: number;
}

@ObjectType()
export class SellerMessage {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  sellerId!: string;

  @Field(() => String)
  sellerName!: string;

  @Field(() => String)
  sellerEmail!: string;

  @Field(() => String)
  subject!: string;

  @Field(() => String)
  body!: string;

  @Field(() => String)
  createdAt!: string;
}
