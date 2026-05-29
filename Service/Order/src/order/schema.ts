import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  Field,
  Float,
  GraphQLISODateTime,
  InputType,
  ObjectType,
  registerEnumType,
} from 'type-graphql';

export enum OrderStatus {
  ORDERED = 'ordered',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Fulfillment status of a buyer order',
});

@ObjectType()
export class OrderItem {
  @Field(() => String)
  itemId!: string;

  @Field(() => String)
  sellerId!: string;
}

@InputType('OrderItemInput')
export class OrderItemInput {
  @Field(() => String)
  @IsUUID()
  itemId!: string;

  @Field(() => String)
  @IsUUID()
  sellerId!: string;
}

@ObjectType()
export class OrderAddress {
  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String)
  line1!: string;

  @Field(() => String, { nullable: true })
  line2?: string;

  @Field(() => String)
  city!: string;

  @Field(() => String)
  state!: string;

  @Field(() => String)
  postalCode!: string;

  @Field(() => String)
  country!: string;
}

@InputType('OrderAddressInput')
export class OrderAddressInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field(() => String)
  @IsString()
  line1!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  line2?: string;

  @Field(() => String)
  @IsString()
  city!: string;

  @Field(() => String)
  @IsString()
  state!: string;

  @Field(() => String)
  @IsString()
  postalCode!: string;

  @Field(() => String)
  @IsString()
  country!: string;
}

@ObjectType()
export class Order {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  buyer!: string;

  @Field(() => [OrderItem])
  items!: OrderItem[];

  @Field(() => GraphQLISODateTime)
  orderedAt!: Date;

  @Field(() => Float)
  purchaseAmount!: number;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => OrderAddress)
  address!: OrderAddress;
}

@InputType('CreateOrderInput')
export class CreateOrderInput {
  @Field(() => String)
  @IsUUID()
  buyer!: string;

  @Field(() => String)
  @IsEmail()
  buyerEmail!: string;

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
  @Field(() => String)
  @IsUUID()
  id!: string;
}

@InputType('BuyerOrdersInput')
export class BuyerOrdersInput {
  @Field(() => String)
  @IsUUID()
  buyer!: string;
}

@InputType('SellerOrdersInput')
export class SellerOrdersInput {
  @Field(() => String)
  @IsUUID()
  seller!: string;
}

@InputType('BuyerHasOrderedItemInput')
export class BuyerHasOrderedItemInput {
  @Field(() => String)
  @IsUUID()
  buyer!: string;

  @Field(() => String)
  @IsUUID()
  itemId!: string;
}

@InputType('UpdateOrderStatusInput')
export class UpdateOrderStatusInput {
  @Field(() => String)
  @IsUUID()
  orderId!: string;

  @Field(() => String)
  @IsUUID()
  seller!: string;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
