import { Inject, Logger, Module, Provider } from '@nestjs/common';
import { ListGateway } from './List.gateway';
import { QueueReducer, ReadModelList } from './ReadModel';
import * as amqp from 'amqplib';
import { ListService } from './list.service';
import { relay, relayWorkQueue, amqpChannelProvider } from './lib/rabbitMq';
import { Event, EventHandlerFunc, Reducer } from 'rimraf-cqrs-lib';
import { ExampleEvents } from 'types';
import { Db, MongoClient, ObjectId, WithId, Document } from 'mongodb';

const readModelListProvider: Provider = {
  provide: 'ReadModelList',
  useFactory: async (database: Db) => {
    return [
      new MyList(database)
    ]
  },
  inject: ["ReadDataseConnection"]
}

const eventBus: Provider = {
  provide: 'EventBus',
  useFactory: (channel: amqp.Channel) => ({
    "Example": relay("Example", channel)
  }),
  inject: ["amqpChannelProvider"]
}

const workQueue: Provider = {
  provide: 'WorkQueue',
  useFactory: async (channel: amqp.Channel) => ({
    "Example": await relayWorkQueue("Example", channel)
  }),
  inject: ["amqpChannelProvider"]
}

const databaseConnection: Provider = {
  provide: "ReadDataseConnection",
  useFactory: async () => {
    const connection = await MongoClient.connect(process.env.MONGODB_URL as string);
    await connection.connect();
    const db = connection.db(process.env.MONGODB_DB as string);
    return db;
  }
}

@Module({
  imports: [],
  controllers: [],
  providers: [
    amqpChannelProvider,
    readModelListProvider,
    eventBus,
    workQueue,
    ListGateway,
    ListService,
    databaseConnection
  ],
})
export class ListModule { }

//share me:
export interface MyListDto {
  ExampleId: string;
  name: string;
}
export const exampleReducer: Reducer<ExampleEvents, MyListDto> = {
  ExampleCreated: (payload, state) => {
    return { ...state, ExampleId: payload.id, name: payload.name };
  },
  ExampleTextChanged: (payload, state) => {
    return { ...state, name: payload.text };
  },
};
//end share me

const genericList = (database: Db, listName: string) =>
  <T extends Document>(listenAggName: string, searchField: keyof T, aggReducer: Reducer<any, T>) =>
    (aggName: string) => {

      const collection = database.collection<T>(listName);

      if (aggName == listenAggName)
        return async (event: Event<unknown>) => {

          const currentStateList = (await collection.find({ [searchField]: event.id } as any).toArray());

          const reducer = aggReducer[event.eventName as any];
          if (reducer !== undefined) {
            if (currentStateList !== undefined && currentStateList.length > 0)
              for (const currentState of currentStateList) {
                const newState = reducer(event.payload as any, currentState as any) as WithId<T>;
                if (newState != currentState) {
                  if (newState !== undefined) {
                    await collection.updateOne({ _id: new ObjectId(newState._id) } as any, { $set: newState } as any)
                  }
                  else {
                    await collection.deleteOne({ _id: new ObjectId(currentState._id) }as any)
                  }
                }
              }
            else {
              const newState = reducer(event.payload as any, { _id: new ObjectId() } as any);
              if (newState !== undefined) {
                await collection.insertOne(newState as any);
              }
            }

          }


          return Promise.resolve()
        }
      return undefined;
    }

class MyList implements ReadModelList {

  constructor(@Inject('ReadDataseConnection') private database: Db) {

  }
  ListName: string = MyList.name;
  AggregateReducer= genericList(this.database,this.ListName)("Example","ExampleId",exampleReducer)
  // AggregateReducer = (aggName: string) => {
  //   if (aggName == "Example")
  //     return async (event: Event<unknown>) => {
  //       const collection = this.database.collection<MyListDto>(this.ListName);

  //       const currentStateList = (await collection.find({ ExampleId: event.id }).toArray());

  //       const reducer = exampleReducer[event.eventName as keyof typeof exampleReducer];
  //       if (reducer !== undefined) {
  //         if (currentStateList !== undefined && currentStateList.length > 0)
  //           for (const currentState of currentStateList) {
  //             const newState = reducer(event.payload as any, currentState) as WithId<MyListDto>;
  //             if (newState != currentState) {
  //               if (newState !== undefined) {
  //                 await collection.updateOne({ _id: new ObjectId(newState._id) }, { $set: newState })
  //               }
  //               else {
  //                 await collection.deleteOne({ _id: new ObjectId(currentState._id) })
  //               }
  //             }
  //           }
  //         else {
  //           const newState = reducer(event.payload as any, { _id: new ObjectId() } as any);
  //           if (newState !== undefined) {
  //             await collection.insertOne(newState);
  //           }
  //         }

  //       }


  //       return Promise.resolve()
  //     }
  //   return undefined;
  // };

}