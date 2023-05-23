
import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
import { exit } from 'process';
dotenv.config();

(async () => {

    const connection = await amqp.connect({
        hostname: process.env.MQTT_HOST,
        port: parseInt(process.env.MQTT_PORT as any),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
    });

    const orderExchange = "OrderAggregat";//agg name
    const orderRoutingKey = "orderCreated";//event name

    const articleExchange = "ArticleAggregat";//agg name
    const articleRoutingKey = "articleCreated";//event name

    const channel = await connection.createChannel();
    //  await channel.deleteQueue("myQueue");
    //await channel.deleteExchange(exchange);
    // exit(0);

    await channel.assertExchange(orderExchange, "fanout", { durable: true });
    const queueOrder = await channel.assertQueue("mylist1", { durable: true });
    channel.bindQueue(queueOrder.queue, orderExchange, "");
    console.log(queueOrder.queue);

    const replyOrder = await channel.consume(queueOrder.queue, (msg) => {
        console.log(queueOrder.queue, msg?.content.toString(), msg?.fields.routingKey)
        if (msg !== null) {

            setTimeout(() => {
                console.log(queueOrder.queue, 'ack')
                channel.ack(msg);
            }, 1000);
        }
    }, { noAck: false })

    console.log(replyOrder);
    ////////////
    await channel.assertExchange(articleExchange, "fanout", { durable: true });
    const queueArticle = await channel.assertQueue("mylist1", { durable: true });
    channel.bindQueue(queueArticle.queue, articleExchange, "");
    console.log(queueArticle.queue);

    const replyArticle = await channel.consume(queueArticle.queue, (msg) => {
        console.log(queueArticle.queue, msg?.content.toString(), msg?.fields.routingKey)
        if (msg !== null) {

            setTimeout(() => {
                console.log(queueArticle.queue, 'ack')
                channel.ack(msg);
            }, 1000);
        }
    }, { noAck: false })

    console.log(replyArticle);



})();
