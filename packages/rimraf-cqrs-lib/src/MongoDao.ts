import { DomainEvent,Dao } from "./types";
import { Connection } from "mongoose";
export class MongoDao implements Dao {

    constructor(private readonly connection: Connection) { }
    load(id: string, aggName: string): Promise<DomainEvent<any>[]> {
        const collection = this.connection.collection<DomainEvent<any>>(aggName);
        const data = collection.find({ id }).toArray();
        return data;
    }
    async insertEvent(event: DomainEvent<any>, aggName: string): Promise<void> {
        const collection = this.connection.collection(aggName);
        await collection.insertOne(event);
    }


}

