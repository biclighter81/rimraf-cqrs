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

  constructor() {
    this.connect();
  }

  private async connect() {
    this.connection = await amqp.connect({
      hostname: process.env.MQTT_HOST,
      port: parseInt(process.env.MQTT_PORT),
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'direct', {
      durable: true,
    });
    await this.channel.assertQueue(this.queue, {
      durable: true,
    });
  }

  async publish<T, R extends keyof T>(event: Event<T[R]>) {
    await this.channel.publish(
      this.exchange,
      event.name,
      Buffer.from(JSON.stringify(event)),
    );
  }

  async subscribe<T, R extends keyof T>(
    eventName: R & string,
    callback: (event: Event<T[R]>) => void,
  ) {
    await this.channel.bindQueue(this.queue, this.exchange, eventName);
    await this.channel.consume(
      this.queue,
      (msg) => {
        const event = JSON.parse(msg.content.toString());
        callback(event);
      },
      { noAck: true },
    );
  }
}
