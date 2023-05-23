import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExampleListDoc = HydratedDocument<ExampleList>;

@Schema()
export class ExampleList {
  @Prop()
  id: string;
  @Prop()
  name: string;

  @Prop()
  text: string;
}

export const ExampleListSchema = SchemaFactory.createForClass(ExampleList);

//gql

// @ObjectType()
// export class ExampleListModel {
//   @Field((type) => String)
//   id: string;
//   @Field((type) => String)
//   name: string;
//   @Field((type) => String)
//   text: string;
// }
