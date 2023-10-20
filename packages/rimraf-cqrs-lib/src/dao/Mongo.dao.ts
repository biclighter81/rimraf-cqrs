import { Db } from "mongodb";
import { DomainEvent } from "../types";
import { IDao } from "./IDao";

export class MongoDao implements IDao {

    constructor(private readonly connection: Db) { }
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

