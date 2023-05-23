
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

    await channel.assertExchange(orderExchange, "fanout", { durable: true });
    await channel.assertExchange(articleExchange, "fanout", { durable: true });

    const order = { data2: "i am orderCreated payload" + new Date().getTime() }
    const article = { data2: "i am articleCreated payload" + new Date().getTime() }
    console.log("send");
    channel.publish(orderExchange, orderRoutingKey, Buffer.from(JSON.stringify(order)), { persistent: true });
    channel.publish(articleExchange, articleRoutingKey, Buffer.from(JSON.stringify(article)), { persistent: true });

    console.log("send");
    setTimeout(async () => {
        await connection.close();
        exit(0);
    }, 2000);

})();
