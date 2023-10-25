import * as amqp from 'amqplib';
import Debug from "debug";
import * as dotenv from 'dotenv';
import { Observable, share } from 'rxjs';

dotenv.config();

interface RabbitEvent<T> {
    payload: T;
    eventName: string;
}

export interface WorkQueueReducer<T> { (event: RabbitEvent<T>): Promise<void> };

export type RabbitMqConnection = ReturnType<typeof getRabbitMqConnection>;
export type RabbitMqConnectionParameter = Parameters<typeof getRabbitMqConnection>[0];

export const getRabbitMqConnection = async (options: amqp.Options.Connect) => {
    const logger = Debug("RabbitMq");
    logger("connect to %s:%d 🌡", options.hostname, options.port);

    const connection = await amqp.connect(options);
    const channel = await connection.createChannel();

    logger("connected 🍗");

    ///publisher
    const aggChannel = {} as { [namespace: string]: (params: RabbitEvent<unknown>) => void }

    const publisher = async (namespace: string, event: RabbitEvent<unknown>) => {

        const logger = Debug("RabbitMq:publisher:" + namespace);

        if (aggChannel[namespace] === undefined) {
            await channel.assertExchange(namespace, "fanout", { durable: true });
            aggChannel[namespace] = (event: RabbitEvent<unknown>) => {
                logger("%s 📤 publish %O", event.eventName,event.payload);
                channel.publish(namespace, event.eventName, Buffer.from(JSON.stringify(event)), { persistent: true });
            }
        }
        const publish = aggChannel[namespace];
        publish(event);
    }

    ///listener

    /**
     * listener/subscriber for pubsub pattern
    */
    const listener = (namespace: string) => {

        return new Observable<RabbitEvent<unknown>>(subscriber => {
            const subscribe = async () => {

                const logger = Debug("RabbitMq:listener:" + namespace);
                logger("listen 👂👂👂 to your 💘");

                await channel.assertExchange(namespace, "fanout", { durable: true });

                const queue = await channel.assertQueue("", { exclusive: true });

                channel.bindQueue(queue.queue, namespace, "");

                await channel.consume(queue.queue, (msg) => {
                    if (msg !== null) {
                        const event = JSON.parse(msg.content.toString()) as RabbitEvent<unknown>;
                        logger("%s received 📥 %O", event.eventName,event.payload);
                        subscriber.next(event)
                    }
                }, { noAck: true })
            }

            subscribe().catch(subscriber.error)

        }).pipe(share())
    }


    ///consumer

    /**
     * consumer/queue worker for queue pattern
    */
    const consumer = async <T>(namespace: string, handler: WorkQueueReducer<T[keyof T]>) => {
        const logger = Debug("RabbitMq:consumer:" + namespace);
        logger("listen 👂👂👂 to your 💘");

        await channel.assertExchange(namespace, "fanout", { durable: true });

        const queue = await channel.assertQueue(namespace, { durable: true });

        channel.bindQueue(queue.queue, namespace, "");

        channel.consume(queue.queue, (msg) => {
            
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString()) as RabbitEvent<T[keyof T]>;
                logger("%s received 📥 %O", event.eventName,event.payload);
                handler(event).then(() => {
                    channel.ack(msg);
                });
            }
        }, { noAck: false })

    }

    return {
        publisher,
        consumer,
        listener,
        close: async () => {
            await channel.close()
            await connection.close()
        }
    }

}