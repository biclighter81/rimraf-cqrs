import { getProjectionServer } from "rimraf-cqrs-lib";
import { getRabbitMqConnection } from "rimraf-rabbitmq";
import projections from "./projections";

export const app = async () => {
    const rabbitServer = await getRabbitMqConnection({
        hostname: process.env.MQTT_HOST,
        port: parseInt(process.env.MQTT_PORT as any),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
    });

    const projectionServer = getProjectionServer(
        process.env.PORT || 4001,
        rabbitServer,
        await projections()
    )

    return projectionServer
}