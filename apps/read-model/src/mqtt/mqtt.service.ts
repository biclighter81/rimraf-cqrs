import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

export type Event<T> = {
  payload: T;
  name: string;
  timestamp: number;
  id: string;
};

@Injectable()
export class MqttService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private exchange: string = 'rimraf-cqrs';
  private queue: string = 'event-queue';
  private subscriptions: {
    [key: string]: {
      callback: (event: any, ack: () => void) => void;
    }[];
  } = {};

  constructor() {
    this.connect();
  }

  private async connect() {
    if (this.connection && this.channel) {
      return;
    }
    this.connection = await amqp.connect({
      hostname: process.env.MQTT_HOST,
      port: parseInt(process.env.MQTT_PORT),
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });
    this.channel = await this.connection.createChannel();
  }

  async publish<T, R extends keyof T>(event: Event<T[R]>) {}

  async subscribe<T, R extends keyof T>(
    eventName: R & string,
    callback: (event: Event<T[R]>, ack: () => void) => void,
  ) {
    await this.connect();
    if (!this.subscriptions[eventName]) {
      this.subscriptions[eventName] = [];
      await this.channel.assertExchange(this.exchange, 'direct', {
        durable: true,
      });
      const queue = await this.channel.assertQueue(this.queue, {
        durable: true,
      });
      await this.channel.bindQueue(queue.queue, eventName, eventName);

      //add callback function to subscriptions before consuming
      this.subscriptions[eventName].push({ callback });

      await this.channel.consume(
        queue.queue,
        async (msg) => {
          const routingKey = msg.fields.routingKey;
          const subscribers = this.subscriptions[routingKey];
          if (subscribers) {
            const event = JSON.parse(msg.content.toString());
            for (const subscriber of subscribers) {
              subscriber.callback(event, () => {
                this.channel.ack(msg);
              });
            }
          }
        },
        { noAck: false },
      );
    } else {
      //already consuming, just add callback function to subscriptions
      this.subscriptions[eventName].push({ callback });
    }
  }
}
