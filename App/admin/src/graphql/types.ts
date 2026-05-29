import { ObjectType, Field, Float } from 'type-graphql';

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
export class AdminItemSeller {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;
}

@ObjectType()
export class AdminItem {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => AdminItemSeller)
  seller!: AdminItemSeller;

  @Field(() => Float)
  price!: number;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  createdAt!: string;
}

@ObjectType()
export class AdminReviewUser {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;
}

@ObjectType()
export class AdminReview {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  itemId!: string;

  @Field(() => String)
  itemName!: string;

  @Field(() => AdminReviewUser)
  user!: AdminReviewUser;

  @Field(() => String)
  content!: string;

  @Field(() => Float)
  rating!: number;

  @Field(() => String)
  createdAt!: string;
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
