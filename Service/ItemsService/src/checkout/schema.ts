import { Min } from 'class-validator';
import {
  Field,
  GraphQLISODateTime,
  InputType,
  Int,
  ObjectType,
} from 'type-graphql';

@InputType()
export class CheckoutReservationLineInput {
  @Field()
  itemId!: string;

  @Field(() => Int)
  @Min(1)
  quantity!: number;
}

@InputType()
export class ReserveCheckoutInput {
  @Field()
  buyerId!: string;

  @Field(() => [CheckoutReservationLineInput])
  items!: CheckoutReservationLineInput[];
}

@InputType()
export class CheckoutReservationIdInput {
  @Field()
  id!: string;
}

@ObjectType()
export class CheckoutReservation {
  @Field()
  id!: string;

  @Field(() => GraphQLISODateTime)
  expiresAt!: Date;
}
