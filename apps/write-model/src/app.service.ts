import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IAggregatRepository, writeRepositoryFactory } from 'rimraf-cqrs-lib';
import { ExampleEvents, Example } from 'types';
import { exampleReducer } from './example/example';
import { rabbitMqServer } from "./lib/rabbitMq";

@Injectable()
export class AppService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {
    const rabbitConnection = rabbitMqServer();

    const factory = writeRepositoryFactory({
      load:async (id, aggName) =>{
        const collection = this.connection.collection(aggName);
        const data = collection.find({ id }).toArray();
        return data as any;
      },
       insertEvent:async(event, aggName) =>{
        const collection = this.connection.collection(aggName);
        await collection.insertOne(event);
        const server = await rabbitConnection;
        console.log(event);
        await server(aggName, event);
      },
    });

    this.Example = factory(exampleReducer, "Example");
  }

  Example: IAggregatRepository<ExampleEvents, Example>;
}