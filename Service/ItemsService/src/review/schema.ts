import { Length, Max, Min } from 'class-validator';
import { Field, Float, GraphQLISODateTime, ObjectType } from 'type-graphql';

@ObjectType()
export class ReviewUser {
  @Field()
  id!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class Review {
  @Field(() => ReviewUser)
  user!: ReviewUser;

  @Field()
  @Length(1, 1024)
  content!: string;

  @Field(() => Float)
  @Min(1)
  @Max(5)
  rating!: number;

  @Field(() => GraphQLISODateTime)
  created_at!: Date;
}
