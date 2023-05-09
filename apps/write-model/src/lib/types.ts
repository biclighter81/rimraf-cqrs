import { Field, ObjectType, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class CommandResponse {
  @Field((type) => ID, { nullable: true })
  id?: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  errorMessage?: string;
}
