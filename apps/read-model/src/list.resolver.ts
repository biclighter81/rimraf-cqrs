import { Args, Field, ObjectType, Query, Resolver, Subscription } from '@nestjs/graphql';
import { ExampleCreated } from 'types';
import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

@ObjectType()
export class ListEvent {
  @Field()
  EventName: string;

  @Field()
  Payload: string;

}


@Resolver()
export class ListResolver {
  private pub = new PubSub();
  constructor() {
    // var i = 1
    // setInterval(() => {
    //   const v = new Test();
    //   v.txt = (i++).toString();
    //   this.pub.publish("test", { mytest: v});
    // }, 1000);

  }

  @Subscription((returns) => ListEvent)
  ExampleList() {
    return this.pub.asyncIterator("ExampleList");
  }

}
