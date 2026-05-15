import { Length, Max, Min } from 'class-validator';
import {
  Field,
  Float,
  GraphQLISODateTime,
  InputType,
  ObjectType,
} from 'type-graphql';

@ObjectType()
export class ReviewUser {
  @Field()
  id!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class Review {
  @Field()
  id!: string;

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

@InputType()
export class NewReview {
  @Field()
  itemId!: string;

  @Field(() => Float)
  @Min(1)
  @Max(5)
  rating!: number;

  @Field()
  @Length(1, 1024)
  comment!: string;
}
