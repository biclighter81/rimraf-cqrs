
import { Logger } from '@nestjs/common';
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

    const aggChannel = {} as { [aggName: string]: (params: Event<unknown> ) => void }

    return async (aggName: string, event: Event<unknown>) => {
        
        const logger = new Logger("amqp publisher " + aggName);

        if (aggChannel[aggName] === undefined) { 
            await channel.assertExchange(aggName, "fanout", { durable: true });
            aggChannel[aggName] = (params: Event<unknown>) => {
                logger.debug(params);
                channel.publish(aggName, params.eventName, Buffer.from(JSON.stringify(params)), { persistent: true });
            }
        }
        const publish = aggChannel[aggName]; 
        publish(event);
    }
}