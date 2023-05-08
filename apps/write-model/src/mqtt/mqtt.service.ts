import { Injectable } from '@nestjs/common';
import { Event } from 'types';
import * as amqp from 'amqplib';

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
      { persistent: true },
    );
  }
}
