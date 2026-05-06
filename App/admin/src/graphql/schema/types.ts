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