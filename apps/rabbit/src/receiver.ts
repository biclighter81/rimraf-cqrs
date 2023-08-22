
import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {

    const connection = await amqp.connect({
        hostname: process.env.MQTT_HOST,
        port: parseInt(process.env.MQTT_PORT as any),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
    });

    const exchange = "Example";//agg name
    const routingKey = "orderCreated";//event name


    const channel = await connection.createChannel();
    //  await channel.deleteQueue("myQueue");
    //await channel.deleteExchange(exchange);
     // exit(0);

    await channel.assertExchange(exchange, "fanout", { durable: true });
    const queue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue.queue, exchange, "");

    const reply = await channel.consume(queue.queue, (msg) => {
        console.log(queue.queue, msg?.content.toString(), msg?.fields.routingKey)
    }, { noAck: true })

    console.log(reply);

})();
