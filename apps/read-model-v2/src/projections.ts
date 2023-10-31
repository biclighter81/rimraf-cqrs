import { MongoClient } from "mongodb";
import { articleOverviewReducer } from "read-reducer";
import { propjectionFactory } from "rimraf-cqrs-lib";
import { getRabbitMqConnection } from "rimraf-rabbitmq";
import { AppEventBus } from "types";

const mongodb = async () => {
    const connection = await MongoClient.connect(process.env.MONGODB_URL as string);
    await connection.connect();
    const db = connection.db(process.env.MONGODB_DB as string);
    return db;
}

export default async () => {
    const db = await mongodb();
    const projection = propjectionFactory<AppEventBus>(db);

    return [
        projection("articleOverview")
            ("Article", articleOverviewReducer, "articleId")
    ]
}