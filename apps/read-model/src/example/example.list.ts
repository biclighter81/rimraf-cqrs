import { InjectModel } from '@nestjs/mongoose';
import { ExampleList } from './example.schema';
import { Model } from 'mongoose';
import { MqttService } from '../mqtt/mqtt.service';
import { ExampleEvents } from 'types';
import { PubSub } from 'graphql-subscriptions';
import { exampleReducer } from 'read-reducer';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ExampleListService implements OnModuleInit {
  public pubSub = new PubSub();

  constructor(
    @InjectModel(ExampleList.name)
    private readonly exampleListModel: Model<ExampleList>,
    private readonly mqtt: MqttService,
  ) {}
  onModuleInit() {
    this.mqtt.subscribe<ExampleEvents, 'ExampleCreated'>(
      'ExampleCreated',
      async (event, ack) => {
        await this.exampleListModel.create({
          id: event.id,
          name: event.payload.name,
        });
        ack();
        this.pubSub.publish('ExampleCreated', {
          exampleCreated: event,
        });
      },
    );

    this.mqtt.subscribe<ExampleEvents, 'ExampleTextChanged'>(
      'ExampleTextChanged',
      async (event, ack) => {
        await this.exampleListModel.updateOne(
          { id: event.id },
          {
            $set: {
              text: event.payload.text,
            },
          },
        );
        ack();
        this.pubSub.publish('ExampleTextChanged', {
          exampleTextChanged: event,
        });
      },
    );
  }

  async example(id: string) {
    return { example: await this.exampleListModel.findOne({ id }) };
  }
}
