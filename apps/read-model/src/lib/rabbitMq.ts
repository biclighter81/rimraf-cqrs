
import { Logger, Provider } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Event } from 'rimraf-cqrs-lib';
import { Observable, share } from 'rxjs';
import { QueueReducer } from '../ReadModel';

export const relay = (aggName: string, channel: amqp.Channel) => {

    return new Observable<Event<unknown>>(subscriber => {
        const subscribe = async () => {

            const logger = new Logger("amqp relay " + aggName);
            logger.debug("listen");

            await channel.assertExchange(aggName, "fanout", { durable: true });

            const queue = await channel.assertQueue("", { exclusive: true });

            channel.bindQueue(queue.queue, aggName, "");

            await channel.consume(queue.queue, (msg) => {
                //logger.debug(msg.content.toString());
                if (msg !== null) {
                    const event = JSON.parse(msg.content.toString()) as Event<unknown>;
                    subscriber.next(event)
                }
            }, { noAck: true })
        }

        subscribe().catch(subscriber.error)

    }).pipe(share())
}

export const relayWorkQueue = async (aggName: string, channel: amqp.Channel) => {
    const logger = new Logger("amqp relayWorkQueue " + aggName);
    logger.debug("init");

    await channel.assertExchange(aggName, "fanout", { durable: true });

    const queue = await channel.assertQueue(aggName, { durable: true });

    channel.bindQueue(queue.queue, aggName, "");
    return (handler: QueueReducer) => {
        logger.debug("listen");

        channel.consume(queue.queue, (msg) => {
            logger.debug(msg?.content.toString());
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString()) as Event<unknown>;
                handler(event).then(() => {
                    channel.ack(msg);
                });
            }
        }, { noAck: false })
    }
}

export const amqpChannelProvider: Provider = {
    provide: 'amqpChannelProvider',
    useFactory: async () => {
        const connection = await amqp.connect({
            hostname: process.env.MQTT_HOST,
            port: parseInt(process.env.MQTT_PORT as any),
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
        });
        const channel = await connection.createChannel();
        return channel;
    },
}