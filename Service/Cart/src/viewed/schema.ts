import { IsUUID } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class ViewedItem {
  @Field()
  id!: string;

  @Field()
  member!: string;

  @Field()
  item!: string;

  @Field()
  viewedAt!: Date;
}

@InputType('MemberViewedItemsInput')
export class MemberViewedItemsInput {
  @Field()
  @IsUUID()
  member!: string;
}

@InputType('RecordViewedItemInput')
export class RecordViewedItemInput {
  @Field()
  @IsUUID()
  member!: string;

  @Field()
  @IsUUID()
  item!: string;
}
