import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Reducer } from './lib/types';
import { randomUUID } from 'crypto';
import { MqttService } from './mqtt/mqtt.service';

export type Event<T> = {
  payload: T;
  name: string;
  timestamp: number;
  id: string;
};

@Injectable()
export class AppService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly mqtt: MqttService,
  ) {}

  async load<T>(aggName: string, id: string) {
    const collection = this.connection.collection(aggName);
    const data = collection.find<Event<T>>({ id }).toArray();
    return data;
  }

  save<T>(aggName: string, eventName: keyof T & string) {
    return async <R extends keyof T>(payload: T[R] & { id?: string }) => {
      const id = payload.id || randomUUID();
      const collection = this.connection.collection(aggName);
      const event: Event<T[R]> = {
        payload,
        name: eventName,
        timestamp: new Date().getTime(),
        id,
      };
      await collection.insertOne(event);
      await this.mqtt.publish<T, R>(event);
      return id;
    };
  }

  async getState<T, U>(
    aggName: string,
    id: string,
    reducer: Reducer<T, U>,
    timestamp?: number,
  ) {
    const events = await this.load<T>(aggName, id);
    if (!events?.length) return null;
    let state: Partial<U> = {};
    for (const event of events) {
      if (timestamp && event.timestamp > timestamp) continue;
      state = reducer[event.name](event, state);
    }
    return state;
  }
}
