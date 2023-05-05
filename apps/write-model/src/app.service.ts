import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Reducer } from './lib/types';

type Event<T> = {
    payload: T;
    name: string;
    timestamp: number;
}

@Injectable()
export class AppService {

    constructor(
        @InjectConnection()
        private readonly connection: Connection
    ) { }

    async load<T>(aggName: string, id: string) {
        const collection = this.connection.collection(aggName);
        const data = collection.find<Event<T>>({ id }).toArray();
        return data;
    }

    save<T>(aggName: string, eventName: keyof T) {
        return async <R extends keyof T>(payload: T[R]) => {
            const collection = this.connection.collection(aggName);
            //TODO: add metadata
            const result = await collection.insertOne({
                payload,
                name: eventName,
                timestamp: new Date().getTime()

            })
            return result.insertedId.toString();
        }
    }

    async getState<T, U>(aggName: string, id: string, reducer: Reducer<T, U>, timestamp?: number) {
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
