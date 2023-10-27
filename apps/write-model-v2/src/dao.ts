import { MongoClient } from "mongodb";
import { LoggerDao, MongoDao, RabbitSender } from "rimraf-cqrs-lib";
import { getRabbitMqConnection } from "rimraf-rabbitmq";

export const getDao = async () => {

    const connection = await MongoClient.connect(process.env.MONGODB_URL as string);
    await connection.connect();

    const dao = new LoggerDao(
        new RabbitSender(
            await getRabbitMqConnection({
                hostname: process.env.MQTT_HOST,
                port: parseInt(process.env.MQTT_PORT as any),
                username: process.env.MQTT_USERNAME,
                password: process.env.MQTT_PASSWORD,
            }),
            new MongoDao(connection, process.env.MONGODB_DB as string)
        )
    );

    return dao;
}