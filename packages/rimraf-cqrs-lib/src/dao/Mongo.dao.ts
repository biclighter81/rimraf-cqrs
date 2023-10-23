import { Db, MongoClient } from "mongodb";
import { DomainEvent } from "../types";
import { IDao } from "./IDao";

export class MongoDao implements IDao {

    private db:Db
    constructor(private readonly connection: MongoClient, dbName:string) {
        this.db=connection.db(dbName);
     }

    load(id: string, aggName: string): Promise<DomainEvent<any>[]> {
        const collection = this.db.collection<DomainEvent<any>>(aggName);
        const data = collection.find({ id }).toArray();
        return data;
    }
    async insertEvent(event: DomainEvent<any>, aggName: string): Promise<void> {
        const collection = this.db.collection(aggName);
        await collection.insertOne(event);
    }
    close(): Promise<void> {
        return this.connection.close()
    }
}

