import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Field, Float, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class OrderItem {
  @Field()
  itemId!: string;

  @Field()
  sellerId!: string;
}

@InputType('OrderItemInput')
export class OrderItemInput {
  @Field()
  @IsUUID()
  itemId!: string;

  @Field()
  @IsUUID()
  sellerId!: string;
}

@ObjectType()
export class OrderAddress {
  @Field({ nullable: true })
  label?: string;

  @Field()
  line1!: string;

  @Field({ nullable: true })
  line2?: string;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  postalCode!: string;

  @Field()
  country!: string;
}

@InputType('OrderAddressInput')
export class OrderAddressInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field()
  @IsString()
  line1!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  line2?: string;

  @Field()
  @IsString()
  city!: string;

  @Field()
  @IsString()
  state!: string;

  @Field()
  @IsString()
  postalCode!: string;

  @Field()
  @IsString()
  country!: string;
}

@ObjectType()
export class Order {
  @Field()
  id!: string;

  @Field()
  buyer!: string;

  @Field(() => [OrderItem])
  items!: OrderItem[];

  @Field()
  orderedAt!: Date;

  @Field(() => Float)
  purchaseAmount!: number;

  @Field(() => OrderAddress)
  address!: OrderAddress;
}

@InputType('CreateOrderInput')
export class CreateOrderInput {
  @Field()
  @IsUUID()
  buyer!: string;

  @Field(() => [OrderItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  items!: OrderItemInput[];

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  purchaseAmount!: number;

  @Field(() => OrderAddressInput)
  @ValidateNested()
  address!: OrderAddressInput;
}

@InputType('OrderIdInput')
export class OrderIdInput {
  @Field()
  @IsUUID()
  id!: string;
}

@InputType('BuyerOrdersInput')
export class BuyerOrdersInput {
  @Field()
  @IsUUID()
  buyer!: string;
}
