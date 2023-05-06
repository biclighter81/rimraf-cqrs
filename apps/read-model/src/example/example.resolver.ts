import { Resolver, Subscription } from '@nestjs/graphql';
import { MqttService } from '../mqtt/mqtt.service';
import { PubSub } from 'graphql-subscriptions';

@Resolver()
export class ExampleResolver {
  constructor(private readonly mqtt: MqttService) {}
  private pubSub = new PubSub();

  @Subscription((returns) => String)
  example() {
    this.mqtt.subscribe<any, any>('ExampleCreated', (event) => {
      this.pubSub.publish('ExampleCreated', { example: JSON.stringify(event) });
    });
    return this.pubSub.asyncIterator('ExampleCreated');
  }
}
