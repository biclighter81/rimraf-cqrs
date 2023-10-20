import { MongoClient } from "mongodb";
import { LoggerDao, MongoDao } from "rimraf-cqrs-lib";


export const getDao = async () => {

    const connection = await MongoClient.connect(process.env.MONGODB_URL as string);
    await connection.connect();
    const db = connection.db(process.env.MONGODB_DB as string);

    const dao = new LoggerDao(new MongoDao(db));

    return dao;
}