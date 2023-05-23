
import * as amqp from 'amqplib';
import { Event } from 'rimraf-cqrs-lib';

export const rabbitMqServer = async () => {
    const connection = await amqp.connect({
        hostname: process.env.MQTT_HOST,
        port: parseInt(process.env.MQTT_PORT as any),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
    });

    const channel = await connection.createChannel();

    const aggChannel = {} as { [aggName: string]: () => void }

    return async (aggName: string, event: Event<unknown>) => {
        if (aggChannel[aggName] === undefined) {
            await channel.assertExchange(aggName, "fanout", { durable: true });
            aggChannel[aggName] = () => {
                channel.publish(aggName, event.eventName, Buffer.from(JSON.stringify(event)), { persistent: true });
            }
        }
        const publish = aggChannel[aggName];
        publish();
    }
}