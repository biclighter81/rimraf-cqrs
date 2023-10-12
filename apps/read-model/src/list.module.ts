import { Inject, Logger, Module, Provider } from '@nestjs/common';
import { ListGateway } from './List.gateway';
import { QueueReducer, ReadModelList } from './ReadModel';
import * as amqp from 'amqplib';
import { ListService } from './list.service';
import { relay, relayWorkQueue, amqpChannelProvider } from './lib/rabbitMq';
import { Event, EventHandlerFunc, Reducer } from 'rimraf-cqrs-lib';
import { ExampleEvents } from 'types';
import { Db, MongoClient, ObjectId, WithId, Document } from 'mongodb';
import { exampleReducer } from 'read-reducer';

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

type ArrayType<T> =
  T extends (infer U)[]
  ? U
  : never

const genericList = (database: Db, listName: string) =>
  <T extends any[]>(listenAggName: string, searchField: keyof ArrayType<T>, aggReducer: Reducer<any, T>) =>
    (aggName: string) => {

      const collection = database.collection<ArrayType<T>>(listName);

      if (aggName == listenAggName)
        return async (event: Event<unknown>) => {

          const currentStateList = (await collection.find({ [searchField]: event.id } as any).toArray());

          const reducer = aggReducer[event.eventName as any];
          if (reducer !== undefined) {
            const newStateList = reducer(event.payload, currentStateList as any || []) as WithId<ArrayType<T>[]>;

            for (const newState of newStateList) {
              if (newState._id === undefined)
                await collection.insertOne(newState as any);
              else {
                const oldItem = currentStateList.find(p => p._id == newState._id)
                if (oldItem === undefined)
                  throw "geht nicht";
                else {
                  if (oldItem !== newState)
                    await collection.updateOne({ _id: new ObjectId(newState._id) } as any, { $set: newState } as any)
                }
              }
            }

            for(const existingItem of currentStateList){
              const oldItem = newStateList.find(p => p._id == existingItem._id);
              if(oldItem === undefined)
                await collection.deleteOne({ _id: new ObjectId(existingItem._id) } as any)
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
  AggregateReducer = genericList(this.database, this.ListName)("Example", "ExampleId", exampleReducer)

}